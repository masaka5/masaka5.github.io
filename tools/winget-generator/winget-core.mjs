export const WINGET_SOURCE_ENDPOINTS = Object.freeze({
  winget: 'https://cdn.winget.microsoft.com/cache',
  msstore: 'https://storeedgefd.dsx.mp.microsoft.com/v9.0',
  'winget-font': 'https://cdn.winget.microsoft.com/fonts',
});

const FONT_SOURCE_PACKAGES = Object.freeze([{
  id: 'Microsoft.FluentFonts',
  name: 'Microsoft Fluent Calibri and Sitka',
  publisher: 'Microsoft Corporation',
  version: '1.0.0.0',
  description: '适用于缓解视觉拥挤的 Calibri 与 Sitka 字体变体。',
  tags: ['字体', 'Calibri', 'Sitka', 'Fluent'],
  sourceType: 'font',
  sourceName: 'winget-font',
}]);

export function searchFontPackages(query = '') {
  const terms = String(query || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return FONT_SOURCE_PACKAGES.filter(item => {
    const haystack = [item.id, item.name, item.publisher, item.description, ...(item.tags || [])].join(' ').toLocaleLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}


export function createStoreSearchRequest(query, take = 50, cursor = '') {
  const keyword = String(query || '').trim();
  const searchUrl = new URL('https://apps.microsoft.com/api/products/search');
  searchUrl.searchParams.set('query', keyword);
  searchUrl.searchParams.set('mediaType', 'Apps');
  searchUrl.searchParams.set('gl', 'CN');
  searchUrl.searchParams.set('hl', 'zh-CN');
  searchUrl.searchParams.set('noItems', String(Math.max(1, Math.min(50, Math.floor(Number(take) || 20)))));
  if (cursor) searchUrl.searchParams.set('cursor', cursor);

  return {
    url: `https://r.jina.ai/${searchUrl.href}`,
    sourceEndpoint: WINGET_SOURCE_ENDPOINTS.msstore,
    init: { method: 'GET', headers: { Accept: 'text/plain' } },
  };
}

export function parseStoreSearchResponse(responseText) {
  const text = String(responseText || '');
  const marker = 'Markdown Content:';
  const markerIndex = text.indexOf(marker);
  const payloadText = (markerIndex >= 0 ? text.slice(markerIndex + marker.length) : text).trim();
  try {
    return JSON.parse(payloadText);
  } catch {
    throw new Error('Microsoft Store 返回了无法识别的搜索结果');
  }
}

export function normalizeStoreResults(payload) {
  const data = Array.isArray(payload?.productsList)
    ? payload.productsList
    : Array.isArray(payload?.Data) ? payload.Data : [];
  return data.map(item => ({
    id: String(item?.productId || item?.PackageIdentifier || '').trim(),
    name: String(item?.title || item?.PackageName || item?.productId || item?.PackageIdentifier || '').trim(),
    publisher: String(item?.publisherName || item?.Publisher || 'Microsoft Store').trim(),
    version: String(item?.Versions?.[0]?.PackageVersion || ''),
    tags: Array.isArray(item?.categories) ? item.categories : Array.isArray(item?.Tags) ? item.Tags : [],
    description: String(item?.description || item?.Description || ''),
    sourceType: 'store',
    sourceName: 'msstore',
  })).filter(item => item.id && item.name);
}
const COMMUNITY_API = 'https://api.winget.run/v2/packages';

export function communitySearchUrl(query, page = 0, take = 50) {
  const params = new URLSearchParams({ query: String(query || '').trim(), take: String(take), page: String(page) });
  return `${COMMUNITY_API}?${params}`;
}

export function normalizeCommunityResults(payload) {
  const packages = Array.isArray(payload?.Packages) ? payload.Packages : [];
  return packages
    .filter(item => item && (item.SearchScore == null || Number(item.SearchScore) > 0))
    .map(item => {
      const latest = item.Latest || item.latest || {};
      return {
        id: String(item.Id || item.id || '').trim(),
        name: String(latest.Name || item.Name || item.Id || item.id || '').trim(),
        publisher: String(latest.Publisher || '').trim(),
        version: Array.isArray(item.Versions) ? String(item.Versions[0] || '') : '',
        tags: Array.isArray(latest.Tags) ? latest.Tags : [],
        description: String(latest.Description || ''),
        homepage: String(latest.Homepage || ''),
        sourceType: 'community',
        sourceName: 'winget',
      };
    })
    .filter(item => item.id && item.name);
}

export function normalizeRestResults(payload, sourceName) {
  const data = Array.isArray(payload?.Data) ? payload.Data : [];
  return data.map(item => ({
    id: String(item.PackageIdentifier || '').trim(),
    name: String(item.PackageName || item.PackageIdentifier || '').trim(),
    publisher: String(item.Publisher || '').trim(),
    version: String(item.Versions?.[0]?.PackageVersion || ''),
    tags: [],
    description: '',
    sourceType: 'custom',
    sourceName,
  })).filter(item => item.id && item.name);
}

export function readSelections(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
    if (!Array.isArray(parsed)) return [];
    const unique = new Map();
    for (const entry of parsed) {
      const item = typeof entry === 'string'
        ? { id: entry, sourceType: 'community', sourceName: 'winget' }
        : entry;
      if (!item || !isValidPackageId(item.id)) continue;
      const sourceType = ['community', 'store', 'custom', 'font'].includes(item.sourceType) ? item.sourceType : 'community';
      const sourceName = sourceType === 'store' ? 'msstore' : sourceType === 'font' ? 'winget-font' : String(item.sourceName || 'winget').trim();
      const normalized = { ...item, id: String(item.id).trim(), sourceType, sourceName };
      unique.set(`${sourceType}:${sourceName}:${normalized.id}`, normalized);
    }
    return [...unique.values()];
  } catch {
    return [];
  }
}

export function isValidPackageId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._+-]{0,255}$/.test(value.trim());
}

function quotePowerShell(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function buildInstallScript(packages, options = {}) {
  const { scope = '', silent = true, agreements = true, exact = true, customSource = null } = options;
  const items = [...new Map((packages || [])
    .filter(item => isValidPackageId(item?.id))
    .map(item => [`${item.sourceType || 'community'}:${item.sourceName || 'winget'}:${item.id}`, item])).values()];
  if (!items.length) return '';

  const lines = ["$ErrorActionPreference = 'Stop'", ''];
  const needsCustomSource = items.some(item => item.sourceType === 'custom');
  if (needsCustomSource && customSource?.name && customSource?.url) {
    lines.push(`winget source add --name ${quotePowerShell(customSource.name)} --arg ${quotePowerShell(customSource.url)} --type Microsoft.Rest`, '');
  }

  for (const item of items) {
    const isStore = item.sourceType === 'store';
    const sourceName = isStore ? 'msstore' : item.sourceName || 'winget';
    const parts = ['winget', 'install', '--id', quotePowerShell(item.id)];
    if (exact) parts.push('--exact');
    parts.push('--source', quotePowerShell(sourceName));
    if (!isStore && scope) parts.push('--scope', quotePowerShell(scope));
    if (!isStore && silent) parts.push('--silent');
    if (agreements) {
      parts.push('--accept-package-agreements');
      if (!isStore) parts.push('--accept-source-agreements');
    }
    parts.push('--disable-interactivity');
    lines.push(parts.join(' '));
  }
  return lines.join('\n');
}
