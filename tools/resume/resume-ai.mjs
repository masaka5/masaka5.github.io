const sectionPresets = {
  summary: '个人简介', experience: '工作经历', education: '教育经历', projects: '项目经历',
  skills: '专业技能', certificates: '证书荣誉', custom: '自定义栏目'
};
const typeAliases = {
  work: 'experience', employment: 'experience', 工作经历: 'experience', 教育经历: 'education',
  project: 'projects', 项目经历: 'projects', skill: 'skills', 专业技能: 'skills',
  certificate: 'certificates', 荣誉: 'certificates', 证书荣誉: 'certificates',
  profile: 'summary', summary: 'summary', 个人简介: 'summary', custom: 'custom', 自定义栏目: 'custom'
};
const profileAliases = { 姓名: 'name', 职位: 'role', 目标职位: 'role', 电话: 'phone', 手机: 'phone', 邮箱: 'email', 城市: 'location', 主页: 'website' };
const PROFILE_FIELDS = ['name', 'role', 'phone', 'email', 'location', 'website'];
const ITEM_FIELDS = ['title', 'org', 'date', 'details'];
const ITEM_SECTIONS = new Set(['experience', 'education', 'projects', 'certificates']);
const FACT_PATTERN = /\d+(?:[.,]\d+)*(?:\s?(?:%|％|年|个月|月|天|小时|分钟|秒|人|项|个|万|亿|[kKmM]|ms))?|[零〇一二两三四五六七八九十百千万亿]+(?:\s?(?:%|％|年|个月|月|天|小时|分钟|秒|人|项|个))?/g;
const CHINESE_DIGITS = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
function chineseNumber(value) {
  if (!value) return value;
  let total = 0, section = 0, number = 0;
  for (const char of value) {
    if (Object.hasOwn(CHINESE_DIGITS, char)) number = CHINESE_DIGITS[char];
    else if (char === '十' || char === '百' || char === '千') {
      const unit = char === '十' ? 10 : char === '百' ? 100 : 1000;
      section += (number || 1) * unit; number = 0;
    } else if (char === '万' || char === '亿') {
      const unit = char === '万' ? 10000 : 100000000;
      total += (section + number) * unit; section = 0; number = 0;
    }
  }
  return String(total + section + number);
}

function cleanText(value, limit = 12000) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}
function newId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(16).slice(2)}`;
}
function factTokens(value) {
  return (String(value ?? '').match(FACT_PATTERN) || []).map((fact) => {
    const compact = fact.replace(/\s+/g, '').replace('％', '%');
    const match = compact.match(/^([零〇一二两三四五六七八九十百千万亿]+)(.*)$/);
    return match ? chineseNumber(match[1]) + match[2] : compact;
  });
}
function filterUnsupportedFacts(value, allowedFacts) {
  const allowed = new Set(factTokens(allowedFacts));
  return cleanText(value).split('\n').flatMap((line) => line.split(/(?<=[。！？；])/).filter(Boolean).filter((part) => factTokens(part).every((fact) => allowed.has(fact)))).join('\n');
}
function normalizeDetails(value, forceBullets = true) {
  const seen = new Set();
  return cleanText(value).split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    if (/^\d+\.\s/.test(line) || /^>\s/.test(line)) return line.replace(/[,，]\s*$/, '');
    if (!forceBullets && !/^[-*•]\s/.test(line)) return line.replace(/[,，]\s*$/, '');
    return '- ' + line.replace(/^[-*•]\s*/, '').replace(/[,，]\s*$/, '');
  }).filter((line) => {
    const key = line.replace(/^[-*•]\s*/, '').replace(/[,，]\s*$/, '').trim();
    line = line.replace(/[,，]\s*$/, '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join('\n');
}

export function buildGenerationPrompt(requirement) {
  const schema = '{"profile":{"name":"","role":"","phone":"","email":"","location":"","website":""},"sections":[{"type":"summary","content":""},{"type":"experience","title":"工作经历","items":[{"title":"","org":"","date":"","details":"- "}]},{"type":"education","title":"教育经历","items":[{"title":"","org":"","date":"","details":""}]},{"type":"projects","title":"项目经历","items":[{"title":"","org":"","date":"","details":"- "}]},{"type":"skills","content":""}]}';
  const instructions = `你是专业中文简历编辑。只输出一个合法、紧凑的 JSON 对象，不要解释、Markdown、代码围栏或思考过程。\n规则：仅使用用户需求中出现的事实；缺失信息留空；不得虚构公司、学校、日期、联系方式、证书或业绩。简介 60-120 字；工作与项目各最多 4 条、每项最多 3 条，详情以“- ”开头，采用“动作 + 方法 + 结果”；技能使用逗号分隔。section.type 仅限 summary、experience、education、projects、skills、certificates、custom。\n固定结构：${schema}\n用户需求：`;
  return instructions + cleanText(requirement, 12000);
}

export function buildPolishPrompt({ text, style = '专业', context = '' }) {
  const rules = {
    专业: '准确、克制、正式，突出职责与结果。',
    简洁: '压缩冗余，使用短句，完整保留事实。',
    成果: '突出动作、方法和可验证结果，不新增任何数字或事实。',
    技术: '突出技术方案、复杂度、工程质量和实际结果，不夸大。'
  };
  return `你是资深中文简历编辑。${rules[style] || rules.专业}\n必须保留原有数字、百分比、时间、公司、技术栈和列表结构；不得虚构或增加信息。只输出润色后的正文，不要标题、解释、代码围栏或思考过程。\n上下文：${cleanText(context, 500)}\n原文：${cleanText(text, 12000)}`;
}

function balancedObject(text) {
  let start = -1, depth = 0, inString = false, escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{') {
      if (depth === 0) start = index;
      depth++;
    } else if (char === '}' && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) return text.slice(start, index + 1);
    }
  }
  return '';
}

export function extractModelJson(raw) {
  const answer = String(raw ?? '').trim();
  const candidate = balancedObject(answer);
  if (!candidate) throw new Error('模型未返回可用的简历数据');
  for (const value of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
    try { return JSON.parse(value); } catch { /* try repaired JSON */ }
  }
  throw new Error('简历数据格式无效，请重新生成');
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const source = payload.resume && typeof payload.resume === 'object' ? payload.resume : payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const profileSource = source.profile || source.个人信息 || {};
  const profile = {};
  for (const [key, value] of Object.entries(profileSource)) profile[profileAliases[key] || key] = value;
  let sections = source.sections || source.栏目;
  if (!Array.isArray(sections) && sections && typeof sections === 'object') sections = Object.entries(sections).map(([type, value]) => ({ type, ...(typeof value === 'object' ? value : { content: value }) }));
  return { ...source, profile, sections: Array.isArray(sections) ? sections : [] };
}

export function normalizeGeneratedResume(payload, current, requirement = '') {
  payload = normalizePayload(payload);
  if (!payload || !Array.isArray(payload.sections)) throw new Error('生成结果缺少简历栏目');
  const profile = {};
  for (const field of PROFILE_FIELDS) profile[field] = cleanText(payload.profile?.[field], field === 'website' ? 160 : 100);
  profile.photo = current?.profile?.photo || '';
  const allowedFacts = new Set(factTokens(requirement));
  const seen = new Map();
  const sections = payload.sections.slice(0, 20).flatMap((source) => {
    if (!source || typeof source !== 'object') return [];
    const type = typeAliases[source.type] || source.type;
    if (!Object.hasOwn(sectionPresets, type)) return [];
    const count = (seen.get(type) || 0) + 1;
    seen.set(type, count);
    let content = filterUnsupportedFacts(source.content ?? source.text ?? '', requirement);
    if (type === 'skills') content = content.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).join(', ');
    const section = { id: newId('section'), type, title: cleanText(source.title, 60) || (count > 1 ? `${sectionPresets[type]} ${count}` : sectionPresets[type]), visible: true, content, items: [] };
    if (ITEM_SECTIONS.has(type)) {
      section.items = (Array.isArray(source.items) ? source.items : []).slice(0, 20).map((item) => {
        const clean = { id: newId('item') };
        for (const field of ITEM_FIELDS) {
          let value = cleanText(item?.[field], field === 'details' ? 12000 : 160);
          if (field === 'details') value = normalizeDetails(filterUnsupportedFacts(value, requirement));
          if (field === 'date' && !factTokens(value).every((fact) => allowedFacts.has(fact))) value = '';
          clean[field] = value;
        }
        return clean;
      }).filter((item) => item.title || item.org || item.details);
    }
    return section.content || section.items.length ? [section] : [];
  });
  if (!sections.length) throw new Error('生成结果没有可用栏目');
  return { profile, sections, meta: { name: profile.name, role: profile.role, sectionCount: sections.length } };
}

function preserveNumericFacts(polished, original) {
  const required = [...new Set(factTokens(original))];
  const present = new Set(factTokens(polished));
  const missing = required.filter((fact) => !present.has(fact));
  if (!missing.length) return polished;
  const fragments = cleanText(original).split(/\n|(?<=[。！？；])/).map((line) => line.trim()).filter(Boolean);
  const restore = fragments.filter((fragment) => factTokens(fragment).some((fact) => missing.includes(fact)) && !polished.includes(fragment));
  return cleanText(restore.length ? `${polished}\n${restore.join('\n')}` : polished);
}

export function cleanPolishedText(raw, original = '') {
  let value = String(raw ?? '').trim();
  value = value.replace(/^```(?:markdown|text)?\s*/i, '').replace(/```\s*$/i, '').trim();
  value = value.replace(/^(润色后的?正文|润色结果|润色后)[:：]\s*/i, '').trim();
  if (value.startsWith('{')) {
    try { const parsed = extractModelJson(value); value = parsed.text || parsed.content || value; } catch { /* keep raw */ }
  }
  value = normalizeDetails(value, false);
  if (!value) throw new Error('模型未返回润色内容');
  return preserveNumericFacts(value, original).slice(0, 12000);
}

export function polishTargets(resume) {
  const targets = [];
  for (const section of resume.sections || []) {
    if (section.type === 'summary' || section.type === 'skills' || section.type === 'custom') {
      if (section.content?.trim()) targets.push({ value: `section:${section.id}`, sectionId: section.id, label: section.title, context: `${section.title}；目标职位：${resume.profile?.role || ''}`, text: section.content });
    }
    for (const item of section.items || []) {
      if (!item.details?.trim()) continue;
      targets.push({ value: `item:${section.id}:${item.id}`, sectionId: section.id, itemId: item.id, label: `${section.title} · ${item.title || item.org || '条目'}`, context: `${section.title}；${item.title || ''}；${item.org || ''}；${item.date || ''}`, text: item.details });
    }
  }
  return targets;
}
