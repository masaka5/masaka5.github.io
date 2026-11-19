const API_BASE = 'https://asanari-nllb-translator.hf.space';
const MAX_CHARS = 5000;
const CACHE_LIMIT = 32;
const STORAGE_KEYS = ['gemini', 'groq', 'openai', 'openrouter'];
const ENGINE_LABELS = {
  nllb: 'NLLB-200',
  hymt: '混元翻译',
  ollama: 'TranslateGemma',
  ollama_qwen35: '通义千问 3.5',
  ollama_qwen3: '通义千问 3',
  gemini: 'Gemini',
  groq_qwen: 'Groq Qwen',
  groq_gptoss: 'Groq GPT-OSS',
  openrouter: 'OpenRouter',
  openai: 'OpenAI'
};
const FALLBACK_ENGINES = [
  { id: 'nllb', name: 'NLLB-200 (600M)', available: true, private: true, kind: 'local', key_field: '' },
  { id: 'hymt', name: 'Hy-MT2 (1.8B)', available: true, private: true, kind: 'local', key_field: '' },
  { id: 'ollama', name: 'TranslateGemma 4B', available: true, private: true, kind: 'local', key_field: '' },
  { id: 'ollama_qwen35', name: 'Qwen3.5 2B', available: true, private: true, kind: 'local', key_field: '' },
  { id: 'ollama_qwen3', name: 'Qwen3 1.7B', available: true, private: true, kind: 'local', key_field: '' },
  { id: 'gemini', name: 'Gemini', kind: 'api', key_field: 'gemini' },
  { id: 'groq_qwen', name: 'Qwen (Groq)', kind: 'api', key_field: 'groq' },
  { id: 'groq_gptoss', name: 'GPT-OSS (Groq)', kind: 'api', key_field: 'groq' },
  { id: 'openrouter', name: 'OpenRouter', kind: 'api', key_field: 'openrouter' },
  { id: 'openai', name: 'OpenAI', kind: 'api', key_field: 'openai' }
];
const SAMPLES = [
  { label: '英 → 中', text: 'Where is the nearest subway station?', source: 'eng_Latn', target: 'zho_Hans' },
  { label: '日 → 中', text: '駅までどのくらいかかりますか？', source: 'jpn_Jpan', target: 'zho_Hans' },
  { label: '韩 → 中', text: '오늘 날씨가 정말 좋네요.', source: 'kor_Hang', target: 'zho_Hans' },
  { label: '法 → 中', text: 'Le train part à neuf heures.', source: 'fra_Latn', target: 'zho_Hans' },
  { label: '中 → 英', text: '今天适合出门散步。', source: 'zho_Hans', target: 'eng_Latn' }
];
const SCRIPT_LANGUAGES = [
  [/[\u3040-\u30ff]/u, 'jpn_Jpan'],
  [/[\uac00-\ud7af]/u, 'kor_Hang'],
  [/[\u0e00-\u0e7f]/u, 'tha_Thai'],
  [/[\u0900-\u097f]/u, 'hin_Deva'],
  [/[\u0600-\u06ff\u0750-\u077f]/u, 'arb_Arab'],
  [/[\u0590-\u05ff]/u, 'heb_Hebr'],
  [/[\u0400-\u04ff]/u, 'rus_Cyrl'],
  [/[\u0980-\u09ff]/u, 'ben_Beng'],
  [/[\u0b80-\u0bff]/u, 'tam_Taml'],
  [/[\u0c00-\u0c7f]/u, 'tel_Telu'],
  [/[\u4e00-\u9fff]/u, 'zho_Hans']
];

const el = (id) => document.getElementById(id);
const ui = {
  engineSelect: el('engineSelect'),
  engineBadge: el('engineBadge'),
  autoTranslate: el('autoTranslate'),
  translateButton: el('translateButton'),
  sourceLanguage: el('sourceLanguage'),
  targetLanguage: el('targetLanguage'),
  swapButton: el('swapButton'),
  sourceText: el('sourceText'),
  samples: el('samples'),
  clearButton: el('clearButton'),
  detectedLanguage: el('detectedLanguage'),
  charCount: el('charCount'),
  resultText: el('resultText'),
  resultMeta: el('resultMeta'),
  copyButton: el('copyButton'),
  languageDialog: el('languageDialog'),
  languageSide: el('languageSide'),
  languageSearch: el('languageSearch'),
  languageList: el('languageList'),
  closeLanguage: el('closeLanguage'),
  settingsDialog: el('settingsDialog'),
  settingsForm: el('settingsForm'),
  settingsButton: el('settingsButton'),
  closeSettings: el('closeSettings'),
  clearKeys: el('clearKeys'),
  status: el('status'),
  serviceState: el('serviceState'),
  toast: el('toast')
};

const state = {
  languages: [],
  languageMap: new Map(),
  engines: FALLBACK_ENGINES,
  source: 'auto',
  target: 'zho_Hans',
  engine: 'nllb',
  detected: 'eng_Latn',
  result: '',
  pickerSide: 'source',
  requestId: 0,
  controller: null,
  autoTimer: 0,
  toastTimer: 0,
  lastMeta: '',
  keys: readKeys()
};
const translationCache = new Map();
let languageProvider;

function readKeys() {
  const keys = {};
  for (const key of STORAGE_KEYS) {
    try { keys[key] = sessionStorage.getItem(`toolbox.translator.${key}`) || ''; } catch { keys[key] = ''; }
  }
  try { keys.openrouterModel = sessionStorage.getItem('toolbox.translator.openrouterModel') || ''; } catch { keys.openrouterModel = ''; }
  return keys;
}

function saveKeys(values) {
  for (const key of STORAGE_KEYS) {
    const value = String(values[key] || '').trim();
    state.keys[key] = value;
    try { value ? sessionStorage.setItem(`toolbox.translator.${key}`, value) : sessionStorage.removeItem(`toolbox.translator.${key}`); } catch { /* storage can be disabled */ }
  }
  state.keys.openrouterModel = String(values.openrouterModel || '').trim();
  try {
    state.keys.openrouterModel
      ? sessionStorage.setItem('toolbox.translator.openrouterModel', state.keys.openrouterModel)
      : sessionStorage.removeItem('toolbox.translator.openrouterModel');
  } catch { /* storage can be disabled */ }
}

function languageFor(code) {
  return state.languageMap.get(code) || { code, name: code, english: code, bcp47: '', dir: 'ltr' };
}

function engineFor(id) {
  return state.engines.find((engine) => engine.id === id) || FALLBACK_ENGINES[0];
}

function engineLabel(engine = engineFor(state.engine)) {
  return ENGINE_LABELS[engine.id] || engine.name || engine.id;
}

function setStatus(message = '', tone = '') {
  ui.status.textContent = message;
  ui.status.dataset.tone = tone;
  if (message && tone === 'error') showToast(message);
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1600);
}

function setBusy(busy) {
  ui.translateButton.disabled = busy;
  ui.translateButton.classList.toggle('loading', busy);
  ui.sourceText.setAttribute('aria-busy', String(busy));
  ui.resultText.classList.toggle('streaming', busy);
}

function setResult(text, options = {}) {
  state.result = text || '';
  const language = languageFor(options.language || state.target);
  if (!text) {
    ui.resultText.innerHTML = '<div class="empty-result"><svg><use href="#i-language"/></svg><span>译文将在这里显示</span></div>';
  } else {
    ui.resultText.textContent = text;
  }
  ui.resultText.lang = language.bcp47 || '';
  ui.resultText.dir = language.dir || 'ltr';
  ui.copyButton.disabled = !text;
  ui.resultMeta.textContent = options.meta || '';
}

function updateLanguageButtons() {
  const source = state.source === 'auto' ? { name: '自动识别', code: 'AUTO', bcp47: '', dir: 'ltr' } : languageFor(state.source);
  const target = languageFor(state.target);
  ui.sourceLanguage.querySelector('strong').textContent = source.name;
  el('sourceCode').textContent = source.code;
  ui.sourceLanguage.setAttribute('aria-label', `源语言：${source.name}，${source.code}`);
  ui.targetLanguage.querySelector('strong').textContent = target.name;
  ui.targetLanguage.querySelector('small').textContent = target.code;
  ui.targetLanguage.setAttribute('aria-label', `目标语言：${target.name}，${target.code}`);
  ui.targetLanguage.dir = target.dir || 'ltr';
  ui.detectedLanguage.textContent = state.source === 'auto' && ui.sourceText.value.trim()
    ? `识别：${languageFor(state.detected).name}`
    : '';
}

function updateCounter() {
  const count = Array.from(ui.sourceText.value).length;
  ui.charCount.textContent = `${count.toLocaleString('zh-CN')} / 5,000`;
  ui.clearButton.disabled = count === 0;
}

function populateEngines(data) {
  const list = Array.isArray(data) ? data : data?.engines;
  if (Array.isArray(list) && list.length) {
    const apiMap = new Map(list.map((engine) => [engine.id, engine]));
    state.engines = FALLBACK_ENGINES.map((fallback) => ({ ...fallback, ...(apiMap.get(fallback.id) || {}) }));
    for (const engine of list) {
      if (!state.engines.some((item) => item.id === engine.id)) state.engines.push(engine);
    }
  }
  ui.engineSelect.replaceChildren();
  let firstAvailable = 'nllb';
  for (const engine of state.engines) {
    const option = document.createElement('option');
    option.value = engine.id;
    const keyHint = engine.key_field && !state.keys[engine.key_field] ? ' · 需密钥' : '';
    option.textContent = `${engineLabel(engine)}${keyHint}`;
    option.title = engine.kind === 'api' ? '需要 API 密钥' : '服务端模型';
    if (engine.available || engine.private) firstAvailable ||= engine.id;
    ui.engineSelect.append(option);
  }
  state.engine = state.engines.some((engine) => engine.id === data?.default) ? data.default : firstAvailable;
  ui.engineSelect.value = state.engine;
  updateEngineBadge();
}

function updateEngineBadge() {
  const engine = engineFor(state.engine);
  ui.engineBadge.textContent = engine.private || engine.kind === 'local' ? '服务端模型' : 'API';
  ui.serviceState.textContent = `${state.languages.length || 203} 种语言 · ${engineLabel(engine)}`;
}

function renderSamples() {
  ui.samples.replaceChildren();
  for (const sample of SAMPLES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sample-chip';
    button.textContent = sample.label;
    button.addEventListener('click', () => {
      state.source = sample.source;
      state.target = sample.target;
      ui.sourceText.value = sample.text;
      updateCounter();
      updateLanguageButtons();
      cancelTranslation();
      if (ui.autoTranslate.checked) scheduleAuto(120);
    });
    ui.samples.append(button);
  }
}

function renderLanguageList(query = '') {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  const matches = state.languages.filter((language) => {
    if (!normalized) return true;
    return `${language.name} ${language.english} ${language.code} ${language.bcp47}`.toLocaleLowerCase('zh-CN').includes(normalized);
  });
  const pinnedOrder = new Map(state.languages.filter((language) => language.pinned).map((language, index) => [language.code, index]));
  matches.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned) return (pinnedOrder.get(a.code) || 0) - (pinnedOrder.get(b.code) || 0);
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  const fragment = document.createDocumentFragment();
  const addOption = (language) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'language-option';
    option.dataset.code = language.code;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(language.code === (state.pickerSide === 'source' ? state.source : state.target)));
    const copy = document.createElement('span');
    const strong = document.createElement('strong');
    const code = document.createElement('code');
    strong.textContent = language.name;
    code.textContent = language.code;
    copy.append(strong);
    option.append(copy, code);
    option.addEventListener('click', () => chooseLanguage(language.code));
    fragment.append(option);
  };
  if (state.pickerSide === 'source' && (!normalized || '自动识别 auto detect'.includes(normalized))) {
    addOption({ code: 'auto', name: '自动识别', english: 'Auto detect', bcp47: '', dir: 'ltr' });
  }
  const pinned = matches.filter((language) => language.pinned);
  const rest = matches.filter((language) => !language.pinned);
  if (pinned.length) fragment.append(groupLabel('常用语言'));
  pinned.forEach(addOption);
  if (rest.length) fragment.append(groupLabel(normalized ? '搜索结果' : '全部语言'));
  rest.forEach(addOption);
  ui.languageList.replaceChildren(fragment);
  if (!ui.languageList.children.length) {
    const empty = document.createElement('p');
    empty.className = 'language-empty';
    empty.textContent = '没有匹配的语言';
    ui.languageList.append(empty);
  }
}

function groupLabel(text) {
  const label = document.createElement('div');
  label.className = 'language-group';
  label.textContent = text;
  return label;
}

function openLanguagePicker(side) {
  state.pickerSide = side;
  ui.languageSide.textContent = side === 'source' ? '源语言' : '目标语言';
  ui.languageSearch.value = '';
  renderLanguageList();
  ui.languageDialog.showModal();
  requestAnimationFrame(() => ui.languageSearch.focus());
}

function chooseLanguage(code) {
  if (state.pickerSide === 'source') {
    state.source = code;
    state.detected = code === 'auto' ? detectLanguageLocally(ui.sourceText.value) : code;
  } else if (code !== 'auto') {
    state.target = code;
  }
  ui.languageDialog.close();
  updateLanguageButtons();
  cancelTranslation();
  if (ui.sourceText.value.trim() && ui.autoTranslate.checked) scheduleAuto(120);
}

function detectLanguageLocally(text) {
  if (!text.trim()) return 'eng_Latn';
  for (const [pattern, code] of SCRIPT_LANGUAGES) if (pattern.test(text)) return code;
  if (/[ñ¿¡]/iu.test(text)) return 'spa_Latn';
  if (/[ãõç]/iu.test(text)) return 'por_Latn';
  if (/[äöüß]/iu.test(text)) return 'deu_Latn';
  if (/[àâçèéêëîïôùûüÿœ]/iu.test(text)) return 'fra_Latn';
  if (/[ąćęłńóśźż]/iu.test(text)) return 'pol_Latn';
  return 'eng_Latn';
}

function mapDetectedLanguage(language) {
  if (!language) return '';
  const normalized = String(language).toLowerCase().replace('_', '-');
  const match = state.languages.find((item) => {
    const bcp = item.bcp47.toLowerCase();
    return bcp === normalized || item.code.toLowerCase() === normalized.replace('-', '_') || bcp.split('-')[0] === normalized.split('-')[0];
  });
  return match?.code || '';
}

async function detectLanguage(text) {
  const local = detectLanguageLocally(text);
  if (!('LanguageDetector' in globalThis)) return local;
  try {
    if (!languageProvider) {
      languageProvider = await globalThis.LanguageDetector.create({
        monitor(m) { m.addEventListener('downloadprogress', () => {}); }
      });
    }
    const result = await languageProvider.detect(text.slice(0, 1200));
    const detected = result?.detectedLanguage?.[0]?.language || result?.[0]?.detectedLanguage;
    return mapDetectedLanguage(detected) || local;
  } catch {
    return local;
  }
}

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const engine = engineFor(state.engine);
  const keyField = engine.key_field;
  if (keyField && state.keys[keyField]) {
    const names = {
      gemini: 'X-Gemini-Key',
      groq: 'X-Groq-Key',
      openai: 'X-OpenAI-Key',
      openrouter: 'X-OpenRouter-Key'
    };
    headers[names[keyField]] = state.keys[keyField];
  }
  if (state.engine === 'openrouter' && state.keys.openrouterModel) headers['X-OpenRouter-Model'] = state.keys.openrouterModel;
  return headers;
}

function cacheKey(text, source, target, engine) {
  return `${engine}\u0000${source}\u0000${target}\u0000${text}`;
}

function setCachedTranslation(key, value) {
  translationCache.delete(key);
  translationCache.set(key, value);
  while (translationCache.size > CACHE_LIMIT) translationCache.delete(translationCache.keys().next().value);
}

function cancelTranslation() {
  state.requestId += 1;
  state.controller?.abort();
  state.controller = null;
  clearTimeout(state.autoTimer);
  setBusy(false);
}

function scheduleAuto(delay = 650) {
  clearTimeout(state.autoTimer);
  if (!ui.autoTranslate.checked || !ui.sourceText.value.trim()) return;
  state.autoTimer = setTimeout(() => translate({ manual: false }), delay);
}

async function translate({ manual = true } = {}) {
  clearTimeout(state.autoTimer);
  const raw = ui.sourceText.value;
  const text = raw.trim();
  if (!text) {
    cancelTranslation();
    setResult('');
    setStatus('');
    return;
  }
  if (Array.from(raw).length > MAX_CHARS) {
    setStatus(`单次最多 ${MAX_CHARS.toLocaleString('zh-CN')} 个字符`, 'error');
    return;
  }
  const engine = engineFor(state.engine);
  const requiredKey = engine.key_field;
  if (requiredKey && !state.keys[requiredKey]) {
    setStatus(`当前引擎需要 ${requiredKey === 'openrouter' ? 'OpenRouter' : requiredKey.toUpperCase()} 密钥`, 'error');
    if (manual) openSettings();
    return;
  }

  const requestId = ++state.requestId;
  state.controller?.abort();
  const controller = new AbortController();
  state.controller = controller;
  let resolvedSource = state.source;
  if (resolvedSource === 'auto') {
    resolvedSource = await detectLanguage(text);
    if (requestId !== state.requestId) return;
    state.detected = resolvedSource;
    updateLanguageButtons();
  }

  if (resolvedSource === state.target) {
    cancelTranslation();
    const meta = '源语言与目标语言相同';
    setResult(raw, { language: state.target, meta });
    setStatus('');
    ui.copyButton.disabled = !raw;
    return;
  }

  const key = cacheKey(raw, resolvedSource, state.target, state.engine);
  const cached = translationCache.get(key);
  if (cached) {
    cancelTranslation();
    setResult(cached, { language: state.target, meta: `${engineLabel(engine)} · 缓存` });
    setStatus('已从缓存读取');
    ui.copyButton.disabled = false;
    return;
  }

  setBusy(true);
  setStatus('正在翻译');
  ui.copyButton.disabled = true;
  let translation = '';
  const startedAt = performance.now();
  const timeout = setTimeout(() => controller.abort('timeout'), 60000);
  try {
    const response = await fetch(`${API_BASE}/api/translate/stream`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ text: raw, source: resolvedSource, target: state.target, engine: state.engine }),
      signal: controller.signal
    });
    if (!response.ok) {
      let detail = `请求失败 (${response.status})`;
      try {
        const payload = await response.json();
        detail = payload.detail || payload.error || payload.message || detail;
      } catch { /* use the status message */ }
      throw new Error(detail);
    }
    if (!response.body) throw new Error('当前浏览器不支持流式响应');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const consume = (line) => {
      if (!line.trim()) return;
      let event;
      try { event = JSON.parse(line); } catch { return; }
      if (requestId !== state.requestId) return;
      if (event.type === 'delta') {
        translation += event.text || '';
        setResult(translation, { language: state.target, meta: `${engineLabel(engine)} · 流式` });
      } else if (event.type === 'done') {
        translation = event.translation ?? translation;
        setResult(translation, { language: state.target, meta: `${engineLabel(engine)} · ${formatDuration(performance.now() - startedAt)}` });
      } else if (event.type === 'error') {
        throw new Error(event.error || event.message || '翻译服务返回错误');
      }
    };
    while (true) {
      const { done, value } = await reader.read();
      if (requestId !== state.requestId) {
        await reader.cancel();
        return;
      }
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        consume(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
      if (done) break;
    }
    consume(buffer);
    if (requestId !== state.requestId) return;
    if (!translation.trim()) throw new Error('未收到译文');
    setCachedTranslation(key, translation);
    ui.copyButton.disabled = false;
    setStatus('');
  } catch (error) {
    const timedOut = String(controller.signal.reason) === 'timeout';
    if (requestId !== state.requestId || (controller.signal.aborted && !timedOut)) return;
    const message = timedOut ? '翻译超时，请重试' : error?.message || '翻译失败';
    setStatus(message, 'error');
  } finally {
    clearTimeout(timeout);
    if (requestId === state.requestId) {
      state.controller = null;
      setBusy(false);
    }
  }
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  return `${(milliseconds / 1000).toFixed(1)} 秒`;
}

function swapLanguagesAndText() {
  const previousSource = state.source === 'auto' ? state.detected : state.source;
  const previousTarget = state.target;
  const previousText = ui.sourceText.value;
  const previousResult = state.result;
  state.source = previousTarget;
  state.target = previousSource;
  if (previousResult.trim()) {
    ui.sourceText.value = previousResult;
  }
  updateCounter();
  updateLanguageButtons();
  cancelTranslation();
  setResult('');
  if (ui.autoTranslate.checked && ui.sourceText.value.trim()) scheduleAuto(180);
}

function openSettings() {
  for (const input of ui.settingsForm.elements) {
    if (input.name) input.value = state.keys[input.name] || '';
  }
  ui.settingsDialog.showModal();
}

async function copyResult() {
  const text = state.result;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast('已复制');
}

function bindEvents() {
  ui.sourceText.addEventListener('input', () => {
    updateCounter();
    cancelTranslation();
    setResult('');
    setStatus('');
    scheduleAuto();
  });
  ui.translateButton.addEventListener('click', () => translate({ manual: true }));
  ui.autoTranslate.addEventListener('change', () => {
    if (ui.autoTranslate.checked) scheduleAuto(100);
  });
  ui.engineSelect.addEventListener('change', () => {
    state.engine = ui.engineSelect.value;
    const engine = engineFor(state.engine);
    ui.engineSelect.options[ui.engineSelect.selectedIndex].textContent = `${engineLabel(engine)}${engine.key_field && !state.keys[engine.key_field] ? ' · 需密钥' : ''}`;
    updateEngineBadge();
    cancelTranslation();
    setResult('');
    if (engine.key_field && !state.keys[engine.key_field]) {
      setStatus('填写密钥后使用此引擎', 'error');
      if (ui.autoTranslate.checked) return;
    }
    scheduleAuto(100);
  });
  ui.sourceLanguage.addEventListener('click', () => openLanguagePicker('source'));
  ui.targetLanguage.addEventListener('click', () => openLanguagePicker('target'));
  ui.swapButton.addEventListener('click', swapLanguagesAndText);
  ui.clearButton.addEventListener('click', () => {
    cancelTranslation();
    ui.sourceText.value = '';
    updateCounter();
    setResult('');
    setStatus('');
    ui.sourceText.focus();
  });
  ui.copyButton.addEventListener('click', copyResult);
  ui.languageSearch.addEventListener('input', () => renderLanguageList(ui.languageSearch.value));
  ui.languageSearch.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    ui.languageList.querySelector('.language-option')?.click();
  });
  ui.closeLanguage.addEventListener('click', () => ui.languageDialog.close());
  ui.settingsButton.addEventListener('click', openSettings);
  ui.closeSettings.addEventListener('click', () => ui.settingsDialog.close());
  ui.settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(ui.settingsForm).entries());
    saveKeys(values);
    populateEngines({ engines: state.engines, default: state.engine });
    ui.settingsDialog.close();
    showToast('设置已保存');
    if (ui.sourceText.value.trim() && ui.autoTranslate.checked) scheduleAuto(100);
  });
  ui.clearKeys.addEventListener('click', () => {
    saveKeys({});
    for (const input of ui.settingsForm.elements) if (input.name) input.value = '';
    populateEngines({ engines: state.engines, default: state.engine });
    showToast('密钥已清除');
  });
  document.addEventListener('keydown', (event) => {
    const command = event.ctrlKey || event.metaKey;
    if (command && event.key === 'Enter') {
      event.preventDefault();
      translate({ manual: true });
    } else if (command && event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      swapLanguagesAndText();
    }
  });
}

async function init() {
  bindEvents();
  renderSamples();
  updateCounter();
  populateEngines({ engines: FALLBACK_ENGINES, default: 'nllb' });
  const [languagesResult, enginesResult] = await Promise.allSettled([
    fetch('./languages.json').then((response) => {
      if (!response.ok) throw new Error('语言列表加载失败');
      return response.json();
    }),
    fetch(`${API_BASE}/api/engines`).then((response) => {
      if (!response.ok) throw new Error('引擎列表加载失败');
      return response.json();
    })
  ]);
  if (languagesResult.status === 'fulfilled') {
    state.languages = languagesResult.value.languages || [];
    state.languageMap = new Map(state.languages.map((language) => [language.code, language]));
    updateLanguageButtons();
  } else {
    setStatus('语言列表加载失败，请刷新重试', 'error');
  }
  if (enginesResult.status === 'fulfilled') populateEngines(enginesResult.value);
  else {
    populateEngines({ engines: FALLBACK_ENGINES, default: 'nllb' });
    setStatus('多引擎状态暂不可用，已启用 NLLB');
  }
  updateLanguageButtons();
  ui.sourceText.focus();
}

init().catch((error) => {
  console.error(error);
  setStatus(error?.message || '翻译工具加载失败', 'error');
});
