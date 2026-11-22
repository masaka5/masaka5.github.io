import {mediaFetch, friendlyError} from './transport.mjs';
import {recordToolUse} from '../../assets/tool-use.mjs';

const STORE_KEY = 'pocket-music-workspace-v2';
const API_DEFAULT = 'https://api.i-meto.com/meting/api';
const METING_API = 'https://api.i-meto.com/meting/api';
const GD_API = 'https://music-api.gdstudio.xyz/api.php';
const SOURCES = [
  ['all', '聚合'], ['netease', '网易云'], ['qq', 'QQ 音乐'], ['kugou', '酷狗'],
  ['kuwo', '酷我'], ['migu', '咪咕'], ['bilibili', '哔哩哔哩'], ['soda', '汽水'],
  ['joox', 'JOOX'], ['qianqian', '千千'], ['apple', 'Apple Music'], ['spotify', 'Spotify']
];
const SOURCE_NAMES = Object.fromEntries(SOURCES);

const readStore = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
};
const stored = readStore();
const state = {
  source: stored.source || 'all', type: stored.type || 'song', query: '',
  format: stored.format || 'source', quality: stored.quality || '192',
  withMeta: stored.withMeta !== false, withCover: stored.withCover === true,
  withLyrics: stored.withLyrics === true, api: stored.api && stored.api !== 'https://music-api.gdstudio.xyz/api.php' ? stored.api : API_DEFAULT,
  favorites: Array.isArray(stored.favorites) ? stored.favorites : [],
  playlists: Array.isArray(stored.playlists) ? stored.playlists : [],
  history: Array.isArray(stored.history) ? stored.history : [],
  results: [], queue: [], library: [], current: null, audioUrl: '', processing: false
};
const saveStore = () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      source: state.source, type: state.type, format: state.format, quality: state.quality,
      withMeta: state.withMeta, withCover: state.withCover, withLyrics: state.withLyrics, api: state.api,
      favorites: state.favorites.slice(-200), playlists: state.playlists.slice(-50), history: state.history.slice(-50)
    }));
  } catch {}
};

const panel = document.createElement('section');
panel.id = 'musicMode';
panel.hidden = true;
panel.innerHTML = `
  <div class="music-head"><div><div class="music-kicker">媒体下载</div><h2>音乐工作台</h2></div><button id="musicClose" class="icon-button" aria-label="关闭">×</button></div>
  <nav class="music-tabs" role="tablist">
    <button class="music-tab active" data-tab="search">搜索</button><button class="music-tab" data-tab="links">链接解析</button>
    <button class="music-tab" data-tab="queue">下载任务<span id="musicQueueCount" class="music-badge">0</span></button>
    <button class="music-tab" data-tab="library">本地音乐</button><button class="music-tab" data-tab="favorites">收藏与歌单</button><button class="music-tab" data-tab="settings">设置</button>
  </nav>
  <div class="music-view active" data-view="search">
    <div class="music-searchbar"><input id="musicQuery" autocomplete="off" placeholder="搜索歌曲、歌手、专辑或歌单"><select id="musicSource" aria-label="音乐来源"></select><select id="musicType" aria-label="搜索类型"><option value="song">歌曲</option><option value="playlist">歌单</option><option value="album">专辑</option></select><button id="musicSearch" class="primary">搜索</button></div>
    <div class="music-quick"><button data-quick="周杰伦">周杰伦</button><button data-quick="Taylor Swift">Taylor Swift</button><button data-quick="每日推荐">每日推荐</button><button data-quick="排行榜">排行榜</button></div>
    <div id="musicSearchStatus" class="music-status" role="status"></div><div id="musicResults" class="music-results"></div>
  </div>
  <div class="music-view" data-view="links"><div class="music-section-title"><strong>批量链接</strong><span>每行一个，可粘贴歌曲、歌单、专辑或视频链接</span></div><textarea id="musicUrls" class="music-textarea" placeholder="粘贴链接，每行一个"></textarea><div class="music-actions"><button id="musicInspect" class="primary">解析并加入任务</button><button id="musicPaste">粘贴</button></div><div id="musicLinkStatus" class="music-status"></div></div>
  <div class="music-view" data-view="queue"><div class="music-section-title"><strong>下载任务</strong><span id="musicQueueSummary"></span></div><div class="music-actions"><button id="musicStartQueue" class="primary">开始下载</button><button id="musicClearQueue">清空已完成</button></div><div id="musicQueue" class="music-list"></div></div>
  <div class="music-view" data-view="library"><div class="music-section-title"><strong>本地音乐</strong><span>浏览器内读取，不上传文件</span></div><label class="music-drop"><input id="musicFiles" type="file" accept="audio/*,.flac,.m4a,.wav,.ogg,.aac" multiple><span>选择或拖入音频文件</span></label><div id="musicLibrary" class="music-list"></div></div>
  <div class="music-view" data-view="favorites"><div class="music-section-title"><strong>收藏与歌单</strong><button id="musicNewPlaylist" class="small-button">新建歌单</button></div><div id="musicFavorites" class="music-list"></div><div id="musicPlaylists" class="music-playlists"></div></div>
  <div class="music-view" data-view="settings"><div class="music-settings"><label>搜索接口<input id="musicApi" type="url" spellcheck="false"></label><div class="music-setting-row"><label>默认格式<select id="musicFormat"><option value="source">原始音频</option><option value="mp3">MP3</option><option value="wav">WAV</option><option value="flac">FLAC</option></select></label><label>音质<select id="musicQuality"><option value="128">128 kbps</option><option value="192">192 kbps</option><option value="320">320 kbps</option></select></label></div><label class="check"><input id="musicMeta" type="checkbox">导出信息文件</label><label class="check"><input id="musicCover" type="checkbox">下载封面</label><label class="check"><input id="musicLyrics" type="checkbox">下载歌词</label><button id="musicSaveSettings" class="primary">保存设置</button><p class="music-note">搜索、试听与下载使用浏览器直连；受登录、地区或版权限制的资源由原站决定。</p></div></div>
  <div class="music-player"><img id="musicCoverArt" alt="" hidden><div class="music-now"><strong id="musicNowTitle">未选择歌曲</strong><span id="musicNowArtist"></span></div><button id="musicPrev" class="player-button" aria-label="上一首">‹</button><button id="musicPlay" class="player-button primary" aria-label="播放">▶</button><button id="musicNext" class="player-button" aria-label="下一首">›</button><input id="musicVolume" aria-label="音量" type="range" min="0" max="1" step=".01" value=".8"><audio id="musicAudio" preload="none"></audio></div>
  <div id="musicToast" class="music-toast" role="status"></div>`;
document.body.append(panel);
const toggle = document.createElement('button');
toggle.id = 'musicModeButton'; toggle.type = 'button'; toggle.textContent = '音乐下载'; document.body.append(toggle);
const $ = selector => panel.querySelector(selector);
const $$ = selector => [...panel.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const safeName = value => String(value || '音乐').replace(/[\\:*?"<>|]+/g, '-').replaceAll('/', '-').trim().slice(0, 120) || '音乐';
const status = (target, text) => { const node = $(target); if (node) node.textContent = text || ''; };
let toastTimer;
const toast = text => { const node = $('#musicToast'); node.textContent = text; node.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2600); };
const download = (blob, name) => { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); };
const formatBytes = bytes => !bytes ? '' : bytes > 1073741824 ? `${(bytes / 1073741824).toFixed(1)} GB` : bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const formatTime = seconds => Number.isFinite(Number(seconds)) ? `${Math.floor(Number(seconds) / 60)}:${String(Math.floor(Number(seconds) % 60)).padStart(2, '0')}` : '';
const sameTrack = (a, b) => a && b && `${a.source}:${a.id}` === `${b.source}:${b.id}`;

for (const [id, name] of SOURCES) $('#musicSource').insertAdjacentHTML('beforeend', `<option value="${id}">${name}</option>`);
$('#musicSource').value = state.source; $('#musicType').value = state.type; $('#musicApi').value = state.api;
$('#musicFormat').value = state.format; $('#musicQuality').value = state.quality; $('#musicMeta').checked = state.withMeta; $('#musicCover').checked = state.withCover; $('#musicLyrics').checked = state.withLyrics;

function showTab(tab) {
  $$('.music-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
  $$('.music-view').forEach(view => view.classList.toggle('active', view.dataset.view === tab));
  if (tab === 'queue') renderQueue(); if (tab === 'favorites') renderFavorites(); if (tab === 'library') renderLibrary();
}
$$('.music-tab').forEach(button => button.onclick = () => showTab(button.dataset.tab));
toggle.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) { showTab('search'); $('#musicQuery').focus(); } };
$('#musicClose').onclick = () => { panel.hidden = true; };
$('#musicVolume').oninput = event => { $('#musicAudio').volume = Number(event.target.value); };

function normaliseTrack(item, sourceHint) {
  if (!item || typeof item !== 'object') return null;
  const artist = Array.isArray(item.artist) ? item.artist.join(' / ') : (item.artist || item.author || item.uploader || '');
  const source = item.source || sourceHint || 'netease';
  const id = String(item.id ?? item.songid ?? item.url_id ?? item.urlId ?? `${source}-${item.name || item.title || Math.random()}`);
  const apiUrl = value => value && /^https?:/i.test(value) && /(?:meting\/api|api\.php)/i.test(value) ? value : '';
  return { ...item, id, source, title: item.title || item.name || item.songname || '未命名歌曲', artist, album: item.album || '', picId: item.pic_id || item.picId || '', cover: item.pic_url || item.cover || '', coverEndpoint: apiUrl(item.pic), lyricEndpoint: apiUrl(item.lrc), urlId: item.url_id || item.urlId || id, lyricId: item.lyric_id || item.lyricId || id, streamUrl: item.url && /^https?:/i.test(item.url) && !/api\.php|meting\/api/i.test(item.url) ? item.url : '', streamEndpoint: apiUrl(item.url) };
}
function parseSearchData(data, source) {
  const rows = Array.isArray(data) ? data : data?.data || data?.result?.songs || data?.songs || data?.playlist?.tracks || [];
  return rows.map(item => normaliseTrack(item, source)).filter(Boolean);
}
async function jsonFetch(url, signal) {
  const text = await textFetch(url, signal);
  if (typeof text === 'object') return text;
  try { return JSON.parse(text); } catch { const start = Math.min(...['{', '['].map(mark => { const index = text.indexOf(mark); return index < 0 ? Number.MAX_SAFE_INTEGER : index; })); const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']')); if (start !== Number.MAX_SAFE_INTEGER && end > start) return JSON.parse(text.slice(start, end + 1)); throw Error('接口返回格式无效'); }
}
async function textFetch(url, signal) {
  let response;
  try { response = await fetch(url, {headers: {'Accept': 'application/json,text/plain'}, signal}); if (!response.ok) throw Error(`HTTP ${response.status}`); }
  catch (error) {
    if (signal?.aborted) throw error;
    const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, '')}`;
    response = await fetch(proxyUrl, {signal}); if (!response.ok) throw error;
  }
  const text = await response.text(); try { return JSON.parse(text); } catch { return text.trim(); }
}
async function searchSource(source, query, type, signal) {
  const metingFirst = ['netease', 'kugou', 'kuwo'].includes(source);
  const primaryApi = metingFirst ? METING_API : (state.api || API_DEFAULT);
  const request = async api => {
    if (api === METING_API) {
      const url = new URL(api); url.searchParams.set('server', source); url.searchParams.set('type', type === 'playlist' ? 'playlist' : 'search'); url.searchParams.set('id', query);
      return parseSearchData(await jsonFetch(url.href, signal), source);
    }
    const params = new URLSearchParams({types: type === 'playlist' ? 'playlist' : 'search', source, count: '30', pages: '1', name: query});
    return parseSearchData(await jsonFetch(`${api}?${params}`, signal), source);
  };
  try { return await request(primaryApi); } catch (primary) {
    if (primaryApi === state.api) throw primary;
    try { return await request(state.api || API_DEFAULT); } catch { throw primary; }
  }
}
async function searchMusic() {
  const query = $('#musicQuery').value.trim(); if (!query) { status('#musicSearchStatus', '请输入搜索内容'); return; }
  state.source = $('#musicSource').value; state.type = $('#musicType').value; state.query = query; saveStore();
  status('#musicSearchStatus', '正在搜索…'); $('#musicSearch').disabled = true;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    let tracks = [];
    if (state.source === 'all') {
      const sources = SOURCES.slice(1).map(item => item[0]);
      const batchesPromise = Promise.allSettled(sources.map(source => searchSource(source, query, state.type, controller.signal)));
      const batches = await Promise.race([batchesPromise, new Promise(resolve => setTimeout(() => resolve(null), 9000))]);
      if (!batches) controller.abort();
      const settled = batches || await batchesPromise;
      settled.forEach(result => { if (result.status === 'fulfilled') tracks.push(...result.value); });
    } else tracks = await searchSource(state.source, query, state.type, controller.signal);
    const seen = new Set(); state.results = tracks.filter(track => { const key = `${track.title}|${track.artist}`.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 80);
    state.history = [{query, source: state.source, time: Date.now()}, ...state.history.filter(item => item.query !== query)].slice(0, 50); saveStore();
    renderResults(); status('#musicSearchStatus', state.results.length ? `找到 ${state.results.length} 首` : '没有找到结果'); recordToolUse('yt-dlp');
  } catch (error) { status('#musicSearchStatus', friendlyError(error)); } finally { clearTimeout(timer); $('#musicSearch').disabled = false; }
}
$('#musicSearch').onclick = searchMusic;
$('#musicQuery').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); searchMusic(); } };
$$('[data-quick]').forEach(button => button.onclick = () => { $('#musicQuery').value = button.dataset.quick; if (button.dataset.quick === '排行榜') { $('#musicType').value = 'playlist'; $('#musicQuery').value = '热歌榜'; } searchMusic(); });

function renderResults() {
  const node = $('#musicResults'); if (!state.results.length) { node.innerHTML = '<div class="music-empty">输入关键词开始搜索</div>'; return; }
  node.innerHTML = state.results.map((track, index) => `<article class="music-card"><div class="music-art">${track.cover || track.picId ? `<img src="${escapeHtml(track.cover || coverUrl(track))}" alt="">` : '<span>♪</span>'}</div><div class="music-card-main"><strong title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist || '未知歌手')}<i>${escapeHtml(track.album || SOURCE_NAMES[track.source] || '')}</i></span><small>${escapeHtml(SOURCE_NAMES[track.source] || track.source)}${track.duration ? ` · ${formatTime(track.duration)}` : ''}</small></div><div class="music-card-actions"><button data-action="play" data-index="${index}" aria-label="试听">▶</button><button data-action="queue" data-index="${index}" aria-label="加入任务">＋</button><button data-action="favorite" data-index="${index}" aria-label="收藏">${isFavorite(track) ? '★' : '☆'}</button><button data-action="playlist" data-index="${index}" aria-label="加入歌单">歌</button><button data-action="lyrics" data-index="${index}" aria-label="歌词">词</button></div></article>`).join('');
  node.querySelectorAll('button[data-action]').forEach(button => button.onclick = () => { const track = state.results[Number(button.dataset.index)]; const action = button.dataset.action; if (action === 'play') playTrack(track); if (action === 'queue') { addQueue(track); toast('已加入下载任务'); } if (action === 'favorite') toggleFavorite(track); if (action === 'playlist') addToPlaylist(track); if (action === 'lyrics') showLyrics(track); });
}
function coverUrl(track) {
  if (track.cover) return track.cover;
  if (track.coverEndpoint) return track.coverEndpoint;
  if (!track.picId) return '';
  if (['netease', 'kugou', 'kuwo'].includes(track.source)) { const url = new URL(METING_API); url.searchParams.set('server', track.source); url.searchParams.set('type', 'pic'); url.searchParams.set('id', track.picId); return url.href; }
  return `${state.api}?types=pic&source=${encodeURIComponent(track.source)}&id=${encodeURIComponent(track.picId)}`;
}
function isFavorite(track) { return state.favorites.some(item => sameTrack(item, track)); }
function toggleFavorite(track) { const index = state.favorites.findIndex(item => sameTrack(item, track)); if (index >= 0) state.favorites.splice(index, 1); else state.favorites.push(track); saveStore(); renderResults(); renderFavorites(); }
function addToPlaylist(track) {
  if (!state.playlists.length) { const name = prompt('歌单名称'); if (!name?.trim()) return; state.playlists.push({name: name.trim(), items: []}); }
  const name = prompt(`加入歌单：${state.playlists.map(item => item.name).join('、')}`, state.playlists[0].name); const list = state.playlists.find(item => item.name === name?.trim());
  if (!list) return; if (!list.items.some(item => sameTrack(item, track))) list.items.push(track); saveStore(); renderFavorites(); toast(`已加入「${list.name}」`);
}

async function getStreamUrl(track) {
  if (track.source === 'local') return track.url;
  if (track.streamUrl) return track.streamUrl;
  if (track.streamEndpoint) { const value = await textFetch(track.streamEndpoint); const direct = value?.url || value?.data?.url || value; if (typeof direct === 'string' && /^https?:/i.test(direct)) { track.streamUrl = direct; return direct; } }
  let data;
  if (['netease', 'kugou', 'kuwo'].includes(track.source)) {
    const endpoint = new URL(METING_API); endpoint.searchParams.set('server', track.source); endpoint.searchParams.set('type', 'url'); endpoint.searchParams.set('id', track.urlId || track.id);
    try { data = await textFetch(endpoint.href); const candidate = data?.url || data?.data?.url || data; if (typeof candidate !== 'string' || !/^https?:/i.test(candidate)) throw Error('Meting 无可用音频流'); } catch { const params = new URLSearchParams({types: 'url', source: track.source, id: track.urlId || track.id}); data = await jsonFetch(`${GD_API}?${params}`); }
  } else {
    const params = new URLSearchParams({types: 'url', source: track.source, id: track.urlId || track.id}); data = await jsonFetch(`${state.api || API_DEFAULT}?${params}`);
  }
  const url = data?.url || data?.data?.url || data?.audio || (typeof data === 'string' ? data : '');
  if (!url) throw Error('没有找到可用音频流'); track.streamUrl = url; return url;
}
async function getLyrics(track) {
  if (track.lyricEndpoint) return textFetch(track.lyricEndpoint);
  let data;
  if (['netease', 'kugou', 'kuwo'].includes(track.source)) { const url = new URL(METING_API); url.searchParams.set('server', track.source); url.searchParams.set('type', 'lrc'); url.searchParams.set('id', track.lyricId || track.id); data = await textFetch(url.href); }
  else { const params = new URLSearchParams({types: 'lyric', source: track.source, id: track.lyricId || track.id}); data = await jsonFetch(`${state.api || API_DEFAULT}?${params}`); }
  return data?.lyric || data?.lrc || (typeof data === 'string' ? data : '');
}
async function playTrack(track) {
  try { const url = await getStreamUrl(track); state.current = track; const audio = $('#musicAudio'); if (state.audioUrl !== url) { if (state.audioUrl) URL.revokeObjectURL(state.audioUrl); state.audioUrl = ''; audio.src = url; } await audio.play(); $('#musicNowTitle').textContent = track.title; $('#musicNowArtist').textContent = `${track.artist || ''}${track.album ? ` · ${track.album}` : ''}`; const cover = coverUrl(track); if (cover) { $('#musicCoverArt').src = cover; $('#musicCoverArt').hidden = false; } $('#musicPlay').textContent = 'Ⅱ'; } catch (error) { toast(friendlyError(error)); }
}
$('#musicPlay').onclick = () => { const audio = $('#musicAudio'); if (!audio.src && state.results[0]) return playTrack(state.results[0]); if (audio.paused) { audio.play(); $('#musicPlay').textContent = 'Ⅱ'; } else { audio.pause(); $('#musicPlay').textContent = '▶'; } };
const playQueueOffset = direction => { const current = state.current ? state.queue.findIndex(item => sameTrack(item, state.current)) : -1; const next = state.queue[(current + direction + state.queue.length) % state.queue.length] || state.results[0]; if (next) playTrack(next); };
$('#musicPrev').onclick = () => playQueueOffset(-1); $('#musicNext').onclick = () => playQueueOffset(1); $('#musicAudio').onended = () => playQueueOffset(1);

function showLyrics(track) {
  const existing = $('#musicLyricsBox'); if (existing) existing.remove(); const box = document.createElement('div'); box.id = 'musicLyricsBox'; box.className = 'music-lyrics'; box.innerHTML = `<div><strong>${escapeHtml(track.title)}</strong><button aria-label="关闭">×</button></div><pre>正在读取歌词…</pre>`; panel.append(box); box.querySelector('button').onclick = () => box.remove();
  getLyrics(track).then(text => { box.querySelector('pre').textContent = text || '暂无歌词'; }).catch(error => { box.querySelector('pre').textContent = friendlyError(error); });
}

function addQueue(track) { if (!track || state.queue.some(item => sameTrack(item, track) && !['error', 'complete'].includes(item.status))) return; state.queue.push({...track, status: 'waiting', progress: 0, error: ''}); renderQueue(); updateQueueCount(); }
function updateQueueCount() { const count = state.queue.filter(item => !['complete'].includes(item.status)).length; $('#musicQueueCount').textContent = count || ''; $('#musicQueueSummary').textContent = `${state.queue.length} 项`; }
function renderQueue() { const node = $('#musicQueue'); updateQueueCount(); if (!state.queue.length) { node.innerHTML = '<div class="music-empty">还没有下载任务</div>'; return; } node.innerHTML = state.queue.map((item, index) => `<div class="music-task"><div class="music-task-art">${item.cover || item.picId ? `<img src="${escapeHtml(item.cover || coverUrl(item))}" alt="">` : '♪'}</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.artist || SOURCE_NAMES[item.source] || '')}</span><div class="music-progress"><i style="width:${Math.round(item.progress || 0)}%"></i></div><small>${item.status === 'complete' ? '已完成' : item.status === 'running' ? `下载中 ${Math.round(item.progress || 0)}%` : item.status === 'error' ? escapeHtml(item.error) : '等待中'}</small></div><button data-remove-task="${index}" aria-label="移除">×</button></div>`).join(''); node.querySelectorAll('[data-remove-task]').forEach(button => button.onclick = () => { state.queue.splice(Number(button.dataset.removeTask), 1); renderQueue(); }); }
async function transcode(blob, inputExt, target, bitrate, track) {
  if (target === 'source' || target === inputExt) return blob;
  const worker = new Worker(new URL('./assets/ffmpeg-worker.js', import.meta.url)); let sequence = 0;
  const call = (type, data, transfer = []) => new Promise((resolve, reject) => { const id = String(++sequence); const onMessage = event => { if (event.data?.id !== id) return; worker.removeEventListener('message', onMessage); event.data.type === 'ERROR' ? reject(Error(String(event.data.data))) : resolve(event.data.data); }; worker.addEventListener('message', onMessage); worker.postMessage({id, type, data}, transfer); });
  try { const input = `/input.${inputExt || 'bin'}`, output = `/output.${target}`, bytes = new Uint8Array(await blob.arrayBuffer()); await call('LOAD', {}); await call('WRITE_FILE', {path: input, data: bytes}, [bytes.buffer]); const codec = target === 'mp3' ? ['-c:a', 'libmp3lame', '-b:a', `${bitrate}k`] : target === 'flac' ? ['-c:a', 'flac'] : ['-c:a', 'pcm_s16le']; const meta = track ? ['-metadata', `title=${track.title || ''}`, '-metadata', `artist=${track.artist || ''}`, '-metadata', `album=${track.album || ''}`] : []; await call('EXEC', {args: ['-i', input, '-vn', '-map_metadata', '0', ...meta, ...codec, output]}); const result = await call('READ_FILE', {path: output}); return new Blob([result], {type: target === 'mp3' ? 'audio/mpeg' : target === 'flac' ? 'audio/flac' : 'audio/wav'}); } finally { worker.terminate(); }
}
async function fetchBlob(url, onProgress) { const response = await mediaFetch(url, {signal: AbortSignal.timeout(180000)}, {mode: 'auto'}); if (!response.ok) throw Error(`音频请求失败（HTTP ${response.status}）`); const total = Number(response.headers.get('content-length')) || 0, reader = response.body?.getReader(); if (!reader) return response.blob(); const chunks = []; let received = 0; while (true) { const part = await reader.read(); if (part.done) break; chunks.push(part.value); received += part.value.byteLength; onProgress?.(total ? received / total * 100 : 0); } const bytes = new Uint8Array(received); let offset = 0; chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.byteLength; }); return new Blob([bytes], {type: response.headers.get('content-type') || 'audio/mpeg'}); }
async function downloadTrack(item) {
  item.status = 'running'; item.progress = 0; renderQueue();
  try { const url = await getStreamUrl(item); const source = await fetchBlob(url, value => { item.progress = value * .8; renderQueue(); }); const ext = (url.match(/\.([a-z0-9]{2,5})(?:\?|$)/i)?.[1] || 'mp3').toLowerCase(); const blob = await transcode(source, ext, state.format, state.quality, item); const base = safeName(`${item.artist ? `${item.artist} - ` : ''}${item.title}`); const extension = state.format === 'source' ? ext : state.format; download(blob, `${base}.${extension}`); if (state.withMeta) download(new Blob([JSON.stringify({title: item.title, artist: item.artist, album: item.album, source: item.source, id: item.id, url: item.webpage_url || ''}, null, 2)], {type: 'application/json'}), `${base}.info.json`); if (state.withCover && coverUrl(item)) { const cover = await fetchBlob(coverUrl(item)); download(cover, `${base}.jpg`); } if (state.withLyrics) { const lyric = await getLyrics(item).catch(() => ''); if (lyric) download(new Blob([lyric], {type: 'text/plain;charset=utf-8'}), `${base}.lrc`); } item.status = 'complete'; item.progress = 100; } catch (error) { item.status = 'error'; item.error = friendlyError(error); } renderQueue();
}
$('#musicStartQueue').onclick = async () => { if (state.processing) return; state.processing = true; const button = $('#musicStartQueue'); button.disabled = true; try { for (const item of state.queue) { if (item.status === 'complete') continue; await downloadTrack(item); } recordToolUse('yt-dlp'); toast('下载任务已完成'); } finally { state.processing = false; button.disabled = false; } };
$('#musicClearQueue').onclick = () => { state.queue = state.queue.filter(item => item.status !== 'complete'); renderQueue(); };

function flatten(items) { const out = []; const walk = item => { if (!item) return; if (Array.isArray(item.entries)) item.entries.forEach(walk); else out.push(item); }; items.forEach(walk); return out; }
async function inspectUrls(urls) { return new Promise((resolve, reject) => { const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'}); const timer = setTimeout(() => { worker.terminate(); reject(Error('解析超时')); }, 180000); worker.onmessage = event => { const data = event.data; if (data.type === 'status') status('#musicLinkStatus', data.text); if (data.type === 'error') { clearTimeout(timer); worker.terminate(); reject(Error(data.text)); } if (data.type === 'result') { clearTimeout(timer); worker.terminate(); resolve(flatten(data.data).map(item => normaliseTrack({...item, title: item.title, urlId: item.id, source: item.extractor || 'yt-dlp'}, item.extractor || 'yt-dlp'))); } }; worker.onerror = event => { clearTimeout(timer); worker.terminate(); reject(event.error || Error('下载引擎异常')); }; worker.postMessage({type: 'inspect', urls, playlist: true, timeout: 60, options: {format: 'bestaudio/best'}, network: {mode: 'auto'}}); }); }
$('#musicInspect').onclick = async () => { const urls = $('#musicUrls').value.split(/\r?\n/).map(value => value.trim()).filter(Boolean); if (!urls.length) { status('#musicLinkStatus', '请先粘贴链接'); return; } const button = $('#musicInspect'); button.disabled = true; status('#musicLinkStatus', '正在解析…'); try { const items = await inspectUrls(urls); items.forEach(addQueue); status('#musicLinkStatus', `已加入 ${items.length} 项`); showTab('queue'); recordToolUse('yt-dlp'); } catch (error) { status('#musicLinkStatus', friendlyError(error)); } finally { button.disabled = false; } };
$('#musicPaste').onclick = async () => { try { $('#musicUrls').value = await navigator.clipboard.readText(); } catch { status('#musicLinkStatus', '无法读取剪贴板，请手动粘贴'); } };

$('#musicFiles').onchange = event => { [...event.target.files].forEach(file => { const item = {id: `local-${crypto.randomUUID()}`, title: file.name.replace(/\.[^.]+$/, ''), artist: '本地文件', album: '', source: 'local', file, size: file.size, type: file.type, url: URL.createObjectURL(file)}; state.library.push(item); }); renderLibrary(); recordToolUse('yt-dlp'); };
const libraryDrop = $('.music-drop'); ['dragenter', 'dragover'].forEach(type => libraryDrop.addEventListener(type, event => { event.preventDefault(); libraryDrop.classList.add('dragging'); })); ['dragleave', 'drop'].forEach(type => libraryDrop.addEventListener(type, event => { event.preventDefault(); libraryDrop.classList.remove('dragging'); })); libraryDrop.addEventListener('drop', event => { const files = [...event.dataTransfer.files].filter(file => file.type.startsWith('audio/') || /\.(flac|m4a|wav|ogg|aac|mp3)$/i.test(file.name)); if (files.length) { state.library.push(...files.map(file => ({id: `local-${crypto.randomUUID()}`, title: file.name.replace(/\.[^.]+$/, ''), artist: '本地文件', source: 'local', file, size: file.size, type: file.type, url: URL.createObjectURL(file)}))); renderLibrary(); } });
function renderLibrary() { const node = $('#musicLibrary'); node.innerHTML = state.library.length ? state.library.map((item, index) => `<div class="music-task"><div class="music-task-art">♪</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>本地文件 · ${formatBytes(item.size)}</span></div><button data-local-play="${index}" aria-label="播放">▶</button></div>`).join('') : '<div class="music-empty">选择音频文件后在这里播放</div>'; node.querySelectorAll('[data-local-play]').forEach(button => button.onclick = () => playTrack(state.library[Number(button.dataset.localPlay)])); }

function renderFavorites() { const fav = $('#musicFavorites'); fav.innerHTML = state.favorites.length ? state.favorites.map((item, index) => `<div class="music-task"><div class="music-task-art">${item.cover || item.picId ? `<img src="${escapeHtml(item.cover || coverUrl(item))}" alt="">` : '★'}</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.artist || '')}</span></div><button data-fav-play="${index}" aria-label="播放">▶</button><button data-fav-remove="${index}" aria-label="取消收藏">×</button></div>`).join('') : '<div class="music-empty">搜索结果可加入收藏</div>'; fav.querySelectorAll('[data-fav-play]').forEach(button => button.onclick = () => playTrack(state.favorites[Number(button.dataset.favPlay)])); fav.querySelectorAll('[data-fav-remove]').forEach(button => button.onclick = () => { state.favorites.splice(Number(button.dataset.favRemove), 1); saveStore(); renderFavorites(); }); const playlists = $('#musicPlaylists'); playlists.innerHTML = state.playlists.map((list, listIndex) => `<div class="music-playlist"><div><strong>${escapeHtml(list.name)}</strong><span>${list.items.length} 首</span></div><div>${list.items.map(item => `<button data-list-play="${listIndex}" data-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`).join('')}</div></div>`).join(''); playlists.querySelectorAll('[data-list-play]').forEach(button => { const list = state.playlists[Number(button.dataset.listPlay)], item = list.items.find(track => track.id === button.dataset.id); button.onclick = () => item && playTrack(item); }); }
$('#musicNewPlaylist').onclick = () => { const name = prompt('歌单名称'); if (!name?.trim()) return; state.playlists.push({name: name.trim(), items: []}); saveStore(); renderFavorites(); };

$('#musicSaveSettings').onclick = () => { state.api = $('#musicApi').value.trim() || API_DEFAULT; state.format = $('#musicFormat').value; state.quality = $('#musicQuality').value; state.withMeta = $('#musicMeta').checked; state.withCover = $('#musicCover').checked; state.withLyrics = $('#musicLyrics').checked; saveStore(); toast('设置已保存'); };
renderResults(); renderQueue(); renderFavorites(); renderLibrary();
