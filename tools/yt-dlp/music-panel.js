import {mediaFetch, friendlyError as networkError} from './transport.mjs';
import {nativeCall, nativeMediaFetch, nativeSong} from './music-native.mjs?v=20261123g';
import {recordToolUse} from '../../assets/tool-use.mjs';
import {normaliseTrack, parseSearchData, parseMusicLink, audioExtension, parseLrc, transcodeArgs, httpUrl, embedMp3Lyrics} from './music-core.mjs?v=20261123f';

const friendlyError=error=>error?.name==='TimeoutError'?'连接超时，请稍后重试':error?.name==='NotSupportedError'?'浏览器无法播放该音源，请切换来源':error?.name==='NotAllowedError'?'请再次点击播放以允许音频播放':error?.name==='AbortError'?'操作已取消':networkError(error);

const STORE_KEY = 'pocket-music-workspace-v2';
const LIBRARY_DB = 'pocket-music-library-v1';
const API_DEFAULT = 'https://api.i-meto.com/meting/api';
const METING_API = 'https://api.i-meto.com/meting/api';
const GD_API = 'https://music-api.gdstudio.xyz/api.php';
const SOURCES = [
  ['all', '聚合'], ['netease', '网易云'], ['qq', 'QQ 音乐'], ['kugou', '酷狗'],
  ['kuwo', '酷我'], ['migu', '咪咕'], ['bilibili', '哔哩哔哩'], ['soda', '汽水'],
  ['joox', 'JOOX'], ['qianqian', '千千'], ['5sing', '5sing'], ['jamendo', 'Jamendo'], ['apple', 'Apple Music'], ['spotify', 'Spotify']
];
const SOURCE_NAMES = Object.fromEntries(SOURCES);
const PUBLIC_SOURCES = ['netease','qq','kugou','kuwo','bilibili','joox','apple'];
const NATIVE_SOURCES = SOURCES.slice(1).map(([id])=>id);
const DISCOVER_PRESETS = [
  ['netease:3778678', '网易云热歌榜', 'netease', '3778678'],
  ['netease:3779629', '网易云新歌榜', 'netease', '3779629'],
  ['netease:3136952023', '网易云精选歌单', 'netease', '3136952023'],
  ['search:热歌榜', '聚合热门歌曲', 'all', '热歌榜'],
  ['category:华语', '华语歌单', 'netease', '华语'],
  ['category:欧美', '欧美歌单', 'netease', '欧美'],
  ['category:日语', '日语歌单', 'netease', '日语'],
  ['category:轻音乐', '轻音乐歌单', 'netease', '轻音乐']
];

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
  withMeta: stored.withMeta === true, withCover: stored.withCover === true,
  withLyrics: stored.withLyrics === true, embedTags: stored.embedTags === true, api: stored.api && stored.api !== 'https://music-api.gdstudio.xyz/api.php' ? stored.api : API_DEFAULT,
  favorites: Array.isArray(stored.favorites) ? stored.favorites.filter(item=>item&&typeof item.title==='string'&&item.id!=null) : [],
  playlists: Array.isArray(stored.playlists) ? stored.playlists.filter(list=>list&&typeof list.name==='string'&&Array.isArray(list.items)).map(list=>({...list,items:list.items.filter(item=>item&&typeof item.title==='string'&&item.id!=null)})) : [],
  history: Array.isArray(stored.history) ? stored.history : [],
  playMode: ['list','single','shuffle'].includes(stored.playMode) ? stored.playMode : 'list', filename: stored.filename || '{artist} - {title}',
  searchPage: 0, results: [], discoverResults: [], queue: [], library: [], current: null, audioUrl: '', processing: false,
  cookies: (()=>{try{return JSON.parse(sessionStorage.getItem('pocket-music-cookies')||'{}')}catch{return {}}})()
};
const portableTrack = item => ({id:String(item.id),source:item.source,title:item.title,artist:item.artist||'',album:item.album||'',duration:Number(item.duration)||0,cover:httpUrl(item.cover),picId:item.picId||'',urlId:item.urlId||item.id,lyricId:item.lyricId||item.id,streamEndpoint:httpUrl(item.streamEndpoint),lyricEndpoint:httpUrl(item.lyricEndpoint),coverEndpoint:httpUrl(item.coverEndpoint),ext:item.ext||'',...(item.nativeSong?{nativeSong:item.nativeSong}:{ } ),...(item.preview?{preview:true}:{}),...(item.source!=='local'&&item.streamUrl&&!item.streamEndpoint?{streamUrl:httpUrl(item.streamUrl)}:{})});
const resolveTrack = item => item?.source === 'local' ? state.library.find(row => row.id === item.id) : item;
const saveStore = () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      source: state.source, type: state.type, format: state.format, quality: state.quality,
      withMeta: state.withMeta, withCover: state.withCover, withLyrics: state.withLyrics, embedTags: state.embedTags, api: state.api,
      favorites: state.favorites.map(portableTrack), playlists: state.playlists.map(list => ({name:list.name,items:list.items.map(portableTrack)})), history: state.history.slice(-50), playMode: state.playMode, filename: state.filename
    }));
  } catch {}
};

const panel = document.createElement('section');
panel.id = 'musicMode';
panel.hidden = true;
panel.innerHTML = `
  <div class="music-head"><div><div class="music-kicker">媒体下载</div><h2>音乐工作台</h2></div><button id="musicClose" class="icon-button" aria-label="关闭">×</button></div>
  <nav class="music-tabs" role="tablist">
    <button class="music-tab active" data-tab="search">搜索</button><button class="music-tab" data-tab="discover">推荐与榜单</button><button class="music-tab" data-tab="links">链接解析</button>
    <button class="music-tab" data-tab="queue">下载任务<span id="musicQueueCount" class="music-badge">0</span></button>
    <button class="music-tab" data-tab="library">本地音乐</button><button class="music-tab" data-tab="favorites">收藏与歌单</button><button class="music-tab" data-tab="settings">设置</button>
  </nav>
  <div class="music-view active" data-view="search">
    <div class="music-searchbar"><input id="musicQuery" autocomplete="off" placeholder="搜索歌曲、歌手、专辑或歌单"><select id="musicSource" aria-label="音乐来源"></select><select id="musicType" aria-label="搜索类型"><option value="song">歌曲</option><option value="playlist">歌单</option><option value="album">专辑</option></select><button id="musicSearch" class="primary">搜索</button></div>
    <div class="music-quick"><button data-quick="周杰伦">周杰伦</button><button data-quick="Taylor Swift">Taylor Swift</button><button data-quick="每日推荐">精选歌单</button><button data-quick="排行榜">排行榜</button></div>
    <div id="musicSearchStatus" class="music-status" role="status"></div><div id="musicResults" class="music-results"></div><div class="music-more"><button id="musicMore" class="small-button" hidden>加载更多</button></div>
  </div>
  <div class="music-view" data-view="discover">
    <div class="music-section-title"><strong>推荐与榜单</strong><span>浏览公开榜单，也可批量加入任务</span></div>
    <div class="music-discoverbar"><select id="musicDiscoverPreset" aria-label="推荐榜单"></select><button id="musicDiscoverLoad" class="primary">加载</button></div>
    <div id="musicDiscoverStatus" class="music-status" role="status"></div><div id="musicDiscoverResults" class="music-results"></div>
  </div>
  <div class="music-view" data-view="links"><div class="music-section-title"><strong>批量链接</strong><span>每行一个，可粘贴歌曲、歌单、专辑或视频链接</span></div><textarea id="musicUrls" class="music-textarea" placeholder="粘贴链接，每行一个"></textarea><div class="music-actions"><button id="musicInspect" class="primary">解析并加入任务</button><button id="musicPaste">粘贴</button></div><div id="musicLinkStatus" class="music-status"></div></div>
  <div class="music-view" data-view="queue"><div class="music-section-title"><strong>下载任务</strong><span id="musicQueueSummary"></span></div><div class="music-actions"><button id="musicStartQueue" class="primary">开始下载</button><button id="musicStopQueue" disabled>停止</button><button id="musicClearQueue">清空已完成</button></div><div id="musicQueue" class="music-list"></div></div>
  <div class="music-view" data-view="library"><div class="music-section-title"><strong>本地音乐</strong><span>文件只保存在当前浏览器</span></div><label class="music-drop"><input id="musicFiles" type="file" accept="audio/*,.flac,.m4a,.wav,.ogg,.aac,.wma" multiple><span>选择或拖入音频文件</span></label><div id="musicLibrary" class="music-list"></div></div>
  <div class="music-view" data-view="favorites"><div class="music-section-title"><strong>收藏与歌单</strong><div class="music-inline"><button id="musicImportPlaylist" class="small-button">导入</button><button id="musicExportPlaylists" class="small-button">导出</button><button id="musicNewPlaylist" class="small-button">新建歌单</button><input id="musicPlaylistFile" type="file" accept=".json,application/json" hidden></div></div><div id="musicFavorites" class="music-list"></div><div id="musicPlaylists" class="music-playlists"></div></div>
  <div class="music-view" data-view="settings"><div class="music-settings"><label>搜索接口<input id="musicApi" type="url" spellcheck="false"></label><div class="music-setting-row"><label>默认格式<select id="musicFormat"><option value="source">原始音频</option><option value="mp3">MP3</option><option value="wav">WAV</option><option value="flac">FLAC</option></select></label><label>音质<select id="musicQuality"><option value="auto">自动</option><option value="128">128 kbps</option><option value="192">192 kbps</option><option value="320">320 kbps</option></select></label></div><label>文件名模板<input id="musicFilename" placeholder="{artist} - {title}" maxlength="120"></label><label class="check"><input id="musicMeta" type="checkbox">导出信息文件</label><label class="check"><input id="musicCover" type="checkbox">下载封面</label><label class="check"><input id="musicLyrics" type="checkbox">下载歌词</label><label class="check"><input id="musicEmbed" type="checkbox">内嵌标题、封面与歌词</label><details class="music-account"><summary>平台登录</summary><div class="music-storage-fields"><div class="music-setting-row"><label>平台<select id="musicLoginSource"><option value="netease">网易云</option><option value="qq">QQ 音乐</option><option value="kugou">酷狗</option><option value="bilibili">哔哩哔哩</option></select></label><label>登录方式<select id="musicLoginType"><option value="qr">二维码</option><option value="wx">微信</option></select></label></div><div class="music-inline"><button id="musicLogin" type="button">生成登录码</button><span id="musicLoginStatus"></span></div><div id="musicLoginQr" class="music-login-qr" hidden></div><label>会话 Cookie<input id="musicCookie" type="password" autocomplete="off" placeholder="仅保存在当前会话"></label></div></details><details class="music-storage"><summary>下载目录与 WebDAV</summary><div class="music-storage-fields"><div class="music-inline"><button id="musicDirectory" type="button">选择目录</button><button id="musicDirectoryReset" type="button">默认位置</button><span id="musicDirectoryName">浏览器下载</span></div><label class="check"><input id="musicDavEnabled" type="checkbox">同时保存到 WebDAV</label><label>WebDAV 目录<input id="musicDavUrl" type="url" placeholder="https://dav.example.com/music/" autocomplete="off"></label><div class="music-setting-row"><label>账号<input id="musicDavUser" autocomplete="off"></label><label>密码<input id="musicDavPassword" type="password" autocomplete="new-password"></label></div><small>连接信息仅本次有效；服务端需允许跨域 PUT。</small></div></details><button id="musicSaveSettings" class="primary">保存设置</button><p class="music-note">公开音源直接使用；登录会话仅保存在当前标签页。</p></div></div>
  <div class="music-player"><img id="musicCoverArt" alt="" hidden><div class="music-now"><strong id="musicNowTitle">未选择歌曲</strong><span id="musicNowArtist"></span></div><button id="musicPrev" class="player-button" aria-label="上一首">‹</button><button id="musicPlay" class="player-button primary" aria-label="播放">▶</button><button id="musicNext" class="player-button" aria-label="下一首">›</button><button id="musicPlayMode" class="player-button" aria-label="切换播放模式" title="列表循环">↻</button><input id="musicVolume" aria-label="音量" type="range" min="0" max="1" step=".01" value=".8"><audio id="musicAudio" preload="none"></audio></div><div class="music-timeline"><span id="musicElapsed">0:00</span><input id="musicSeek" type="range" min="0" max="1000" value="0" aria-label="播放进度"><span id="musicDuration">0:00</span></div>
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
for (const [id, name] of DISCOVER_PRESETS) $('#musicDiscoverPreset').insertAdjacentHTML('beforeend', `<option value="${id}">${name}</option>`);
$('#musicSource').value = state.source; $('#musicType').value = state.type; $('#musicApi').value = state.api;
$('#musicFilename').value = state.filename;
$('#musicFormat').value = state.format; $('#musicQuality').value = state.quality; $('#musicMeta').checked = state.withMeta; $('#musicCover').checked = state.withCover; $('#musicLyrics').checked = state.withLyrics; $('#musicEmbed').checked = state.embedTags;

function showTab(tab) {
  $$('.music-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
  $$('.music-view').forEach(view => view.classList.toggle('active', view.dataset.view === tab));
  if (tab === 'queue') renderQueue(); if (tab === 'favorites') renderFavorites(); if (tab === 'library') renderLibrary();
}
$$('.music-tab').forEach(button => button.onclick = () => showTab(button.dataset.tab));
toggle.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) { showTab('search'); $('#musicQuery').focus(); recordToolUse('yt-dlp'); } };
$('#musicClose').onclick = () => { panel.hidden = true; };
$('#musicVolume').oninput = event => { $('#musicAudio').volume = Number(event.target.value); };

async function jsonFetch(url, signal) {
  const text = await textFetch(url, signal);
  if (typeof text === 'object') return text;
  try { return JSON.parse(text); } catch { const start = Math.min(...['{', '['].map(mark => { const index = text.indexOf(mark); return index < 0 ? Number.MAX_SAFE_INTEGER : index; })); const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']')); if (start !== Number.MAX_SAFE_INTEGER && end > start) return JSON.parse(text.slice(start, end + 1)); throw Error('接口返回格式无效'); }
}
async function textFetch(url, signal) {
  signal = signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000);
  let response;
  try { response = await fetch(url, {headers: {'Accept': 'application/json,text/plain'}, signal}); if (!response.ok) throw Error(`HTTP ${response.status}`); }
  catch (error) {
    if (signal?.aborted) throw error;
    const proxyUrl = `https://r.jina.ai/${url}`;
    response = await fetch(proxyUrl, {signal}); if (!response.ok) throw error;
  }
  const text = await response.text(); try { return JSON.parse(text); } catch { return text.trim(); }
}
function collectionItem(item, source, kind) {
  return {id: String(item.id || item.collectionId), source, kind, title: item.name || item.collectionName, artist: item.creator?.nickname || item.artist?.name || item.artistName || '', cover: httpUrl(item.coverImgUrl || item.picUrl || item.artworkUrl100), count: item.trackCount || item.size || 0};
}
async function readCollection(item, signal) {
  if (item.kind && NATIVE_SOURCES.includes(item.source)) {
    const native=await nativeCall({op:item.kind==='album'?'album':'playlist',source:item.source==='5sing'?'fivesing':item.source,cookie:state.cookies[item.source]||'',id:String(item.id)},{signal,timeout:30000});
    return (native||[]).map(row=>normaliseTrack({...row,title:row.title||row.name,nativeSong:row},item.source)).filter(Boolean);
  }
  if (['netease','qq','kugou','kuwo'].includes(item.source)) {
    const type=item.kind === 'album'||item.type === 'album'?'album':'playlist';
    const url=new URL(METING_API);url.searchParams.set('server',item.source);url.searchParams.set('type',type);url.searchParams.set('id',item.id);
    let failure;
    try {const tracks=parseSearchData(await jsonFetch(url.href,signal),item.source);if(tracks.length)return tracks;}catch(error){failure=error;}
    if(item.source === 'netease' && type === 'album'){
      const data=await jsonFetch(`https://music.163.com/api/v1/album/${encodeURIComponent(item.id)}`,signal);
      if(data.code&&data.code!==200)throw Error(data.message||'专辑暂不可访问');
      const tracks=parseSearchData(data,'netease');if(tracks.length)return tracks;
    }
    throw failure||Error('暂未返回曲目，请稍后重试');
  }
  if (item.source === 'apple') {
    const data = await jsonFetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(item.id)}&entity=song`, signal);
    return (data.results || []).filter(row => row.wrapperType === 'track' && row.previewUrl).map(row => normaliseTrack({id:row.trackId,title:row.trackName,artist:row.artistName,album:row.collectionName,url:row.previewUrl,cover:row.artworkUrl100,duration:30,preview:true},'apple'));
  }
  throw Error('此来源的歌单或专辑接口暂不可用');
}
async function searchCollections(source, query, type, signal, page=1) {
  if (source === 'netease') {
    const params = new URLSearchParams({s:query,type:type === 'album' ? '10' : '1000',offset:String((page-1)*30),total:'true',limit:'30'});
    const data = await jsonFetch(`https://music.163.com/api/search/get?${params}`, signal);
    return (data.result?.[type === 'album' ? 'albums' : 'playlists'] || []).map(item => collectionItem(item, source, type));
  }
  if (source === 'apple' && type === 'album') {
    const data = await jsonFetch(`https://itunes.apple.com/search?${new URLSearchParams({term:query,entity:'album',limit:'200'})}`,signal);
    return (data.results || []).slice((page-1)*30,page*30).map(item => collectionItem(item, source, type));
  }
  throw Error(`${SOURCE_NAMES[source] || source}暂未提供可用的${type === 'album' ? '专辑' : '歌单'}搜索接口`);
}
async function openCollection(item, queue = false) {
  status('#musicSearchStatus', '正在读取曲目…');
  try {
    const tracks = await readCollection(item, AbortSignal.timeout(15000));
    if (queue) { tracks.forEach(track=>addQueue(track,false));renderQueue(); toast(`已加入 ${tracks.length} 首`); }
    else { state.results = tracks; $('#musicMore').hidden=true;state.searchPage=0;showTab('search'); renderResults(); }
    status('#musicSearchStatus', `${item.title || ''} · ${tracks.length} 首`);
  } catch(error) { status('#musicSearchStatus', friendlyError(error)); }
}
async function searchSource(source, query, type, signal, page=1) {
  if (NATIVE_SOURCES.includes(source)) {
    try {
      const op=type==='playlist'?'playlists':type==='album'?'albums':'search';
      const native=await nativeCall({op,source:source==='5sing'?'fivesing':source,cookie:state.cookies[source]||'',query,page,limit:30},{signal,timeout:30000});
      if(type!=='song') return (native||[]).map(item=>collectionItem({id:item.id,name:item.name,creator:item.creator,coverImgUrl:item.cover,trackCount:item.track_count||item.trackCount},source,type));
      return (native||[]).map(item=>normaliseTrack({...item,title:item.title||item.name,nativeSong:item},source)).filter(Boolean);
    } catch (error) {
      if (signal?.aborted) throw error;
      if (source==='bilibili'||source==='apple'||source==='5sing'||source==='soda') throw error;
    }
  }
  if (type !== 'song') return searchCollections(source, query, type, signal, page);
  if (state.api === API_DEFAULT && !PUBLIC_SOURCES.includes(source)) throw Error(`${SOURCE_NAMES[source] || source}需要配置支持该平台的搜索接口`);
  if (source === 'apple') {
    const data = await jsonFetch(`https://itunes.apple.com/search?${new URLSearchParams({term:query,entity:'song',limit:'200'})}`,signal);
    return (data.results || []).slice((page-1)*30,page*30).map(row => normaliseTrack({id:row.trackId,title:row.trackName,artist:row.artistName,album:row.collectionName,url:row.previewUrl,cover:row.artworkUrl100,duration:30,preview:true},'apple')).filter(Boolean);
  }
  if(source==='netease'&&page>1){const data=await jsonFetch(`https://music.163.com/api/search/get?${new URLSearchParams({s:query,type:'1',offset:String((page-1)*30),limit:'30'})}`,signal);if(data.code&&data.code!==200)throw Error(data.message||'搜索接口暂不可用');return parseSearchData(data,source);}
  const metingFirst = page===1 && ['netease', 'qq', 'kugou', 'kuwo'].includes(source);
  const primaryApi = metingFirst ? METING_API : (state.api !== METING_API ? state.api : GD_API);
  const request = async api => {
    if (api === METING_API) {
      const url = new URL(api); url.searchParams.set('server', source); url.searchParams.set('type', type === 'playlist' ? 'playlist' : 'search'); url.searchParams.set('id', query);url.searchParams.set('page',String(page));url.searchParams.set('limit','30');
      return parseSearchData(await jsonFetch(url.href, signal), source);
    }
    const apiType = type === 'playlist' ? 'playlist' : type === 'album' ? 'album' : 'search'; const params = new URLSearchParams({types: apiType, source, count: '30', pages: String(page), name: query});
    const data=await jsonFetch(`${api}?${params}`,signal);if(data?.detail)throw Error(`${SOURCE_NAMES[source] || source}接口暂不可用`);return parseSearchData(data,source);
  };
  const candidates = [...new Set([primaryApi, state.api !== METING_API ? state.api : GD_API])];
  let lastError;
  for (const api of candidates) {
    try {
      const rows = await request(api);
      if (rows.length || api === candidates.at(-1)) return rows;
    } catch (error) { lastError = error; }
  }
  if (lastError) throw lastError;
  return [];
}
let searchController, searchGeneration=0;
async function searchMusic(append=false) {
  const query=$('#musicQuery').value.trim();if(!query){status('#musicSearchStatus','请输入搜索内容');return;}
  const source=$('#musicSource').value,type=$('#musicType').value;
  append=append&&state.source===source&&state.type===type&&state.query===query;
  const page=append?state.searchPage+1:1;
  state.source=source;state.type=type;state.query=query;saveStore();
  searchController?.abort();const generation=++searchGeneration,controller=new AbortController();searchController=controller;
  const timer=setTimeout(()=>controller.abort(),12000),base=append?[...state.results]:[];
  $('#musicSearch').disabled=true;$('#musicMore').disabled=true;status('#musicSearchStatus','正在搜索…');
  const incoming=[];
  const publish=()=>{
    if(generation!==searchGeneration)return;
    const seen=new Set(),ids=new Set();state.results=[...base,...incoming].filter(track=>{const id=`${track.source}:${track.id}`;const key=`${track.kind||'song'}:${track.title}|${track.artist}|${track.album||''}`.toLowerCase();if(ids.has(id)||seen.has(key))return false;ids.add(id);seen.add(key);return true;});renderResults();
  };
  try{
    if(source==='all'){
      const sources=state.api===API_DEFAULT?PUBLIC_SOURCES:SOURCES.slice(1).map(row=>row[0]);
      const batches=await Promise.allSettled(sources.map(async name=>{const rows=await searchSource(name,query,type,controller.signal,page);if(generation!==searchGeneration)return;incoming.push(...rows);publish();status('#musicSearchStatus',`已找到 ${state.results.length} 项 · 搜索中…`);}));
      if(batches.every(item=>item.status==='rejected'))throw Error('音乐接口暂不可用，请稍后重试或配置接口');
    }else incoming.push(...await searchSource(source,query,type,controller.signal,page));
    if(generation!==searchGeneration)return;
    publish();state.searchPage=page;
    state.history=[{query,source,time:Date.now()},...state.history.filter(item=>item.query!==query)].slice(0,50);saveStore();
    status('#musicSearchStatus',state.results.length?`找到 ${state.results.length} ${type==='song'?'首':'项'}${append&&state.results.length===base.length?' · 没有更多结果':''}`:'没有找到结果');
    $('#musicMore').hidden=!incoming.length||(append&&state.results.length===base.length);recordToolUse('yt-dlp');
  }catch(error){if(generation===searchGeneration)status('#musicSearchStatus',friendlyError(error));}
  finally{clearTimeout(timer);if(generation===searchGeneration){$('#musicSearch').disabled=false;$('#musicMore').disabled=false;searchController=null;}}
}
$('#musicSearch').onclick=()=>searchMusic();$('#musicMore').onclick=()=>searchMusic(true);
$('#musicQuery').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); searchMusic(); } };
$$('[data-quick]').forEach(button => button.onclick = () => { $('#musicQuery').value = button.dataset.quick; if (['排行榜','每日推荐'].includes(button.dataset.quick)) { showTab('discover'); $('#musicDiscoverPreset').value = button.dataset.quick === '排行榜' ? 'netease:3778678' : 'netease:3136952023'; return loadDiscover(); } searchMusic(); });
async function loadDiscover() {
  const [kind, value] = $('#musicDiscoverPreset').value.split(':');
  status('#musicDiscoverStatus', '正在加载…'); $('#musicDiscoverLoad').disabled = true;
  try {
    let rows = [];
    if (kind === 'netease') {
      const url = new URL(METING_API); url.searchParams.set('server', 'netease'); url.searchParams.set('type', 'playlist'); url.searchParams.set('id', value);
      rows = parseSearchData(await jsonFetch(url.href), 'netease');
    } else if (kind === 'category') {
      const data = await jsonFetch(`https://music.163.com/api/playlist/list?${new URLSearchParams({cat:value,limit:'30',order:'hot'})}`);
      rows = (data.playlists || []).map(item => collectionItem(item, 'netease', 'playlist'));
    } else {
      const signal = AbortSignal.timeout(9000);
      const batches = await Promise.allSettled(PUBLIC_SOURCES.map(source => searchSource(source, value, 'song', signal)));
      rows = batches.flatMap(result => result.status === 'fulfilled' ? result.value : []);
    }
    const seen = new Set(); state.discoverResults = rows.filter(track => { const key = `${track.title}|${track.artist}`.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 80);
    renderDiscoverResults(); status('#musicDiscoverStatus', state.discoverResults.length ? `已加载 ${state.discoverResults.length} 首` : '暂无公开内容'); recordToolUse('yt-dlp');
  } catch (error) { status('#musicDiscoverStatus', friendlyError(error)); }
  finally { $('#musicDiscoverLoad').disabled = false; }
}
$('#musicDiscoverLoad').onclick = loadDiscover;

function renderTrackCards(node, tracks, emptyText = '暂无内容') {
  if (!tracks.length) { node.innerHTML = `<div class="music-empty">${escapeHtml(emptyText)}</div>`; return; }
  node.innerHTML = `<div class="music-batch"><button data-batch="queue">全部加入任务</button><button data-batch="playlist">存为歌单</button></div>` + tracks.map((track, index) => `<article class="music-card"><div class="music-art">${coverUrl(track) ? `<img loading="lazy" src="${escapeHtml(track.cover || coverUrl(track))}" alt="">` : '<span>♪</span>'}</div><div class="music-card-main"><strong title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist || '未知歌手')}<i>${escapeHtml(track.album || SOURCE_NAMES[track.source] || '')}</i></span><small>${escapeHtml(SOURCE_NAMES[track.source] || track.source)}${track.kind ? ` · ${track.kind === 'album' ? '专辑' : '歌单'} · ${track.count} 首` : track.preview ? ' · 30 秒试听' : track.duration ? ` · ${formatTime(track.duration)}` : ''}</small></div><div class="music-card-actions">${track.kind ? `<button data-action="open" data-index="${index}" aria-label="打开曲目">↗</button>` : `<button data-action="play" data-index="${index}" aria-label="试听">▶</button><button data-action="queue" data-index="${index}" aria-label="加入任务">＋</button><button data-action="favorite" data-index="${index}" aria-label="收藏">${isFavorite(track) ? '★' : '☆'}</button><button data-action="switch" data-index="${index}" aria-label="换源">⇄</button><button data-action="playlist" data-index="${index}" aria-label="加入歌单" title="加入歌单"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5h11M4 10h11M4 15h6M17 13v8M13 17h8"/></svg></button><button data-action="lyrics" data-index="${index}" aria-label="歌词" title="歌词"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></button>`}</div></article>`).join('');
  const collect=async()=>{const items=[];let failed=0;for(const track of tracks){if(track.kind){try{items.push(...await readCollection(track,AbortSignal.timeout(15000)));}catch{failed++;}}else items.push(track);}return{items,failed};};
  node.querySelector('[data-batch="queue"]').onclick=async event=>{
    event.currentTarget.disabled=true;
    try{const {items,failed}=await collect();items.forEach(item=>addQueue(item,false));renderQueue();toast(`${items.length} 首已加入${failed?` · ${failed} 项未能读取`:''}`);}
    catch(error){toast(friendlyError(error));}finally{const button=node.querySelector('[data-batch="queue"]');if(button)button.disabled=false;}
  };
  node.querySelector('[data-batch="playlist"]').onclick=async event=>{
    const name=prompt('歌单名称');if(!name?.trim())return;event.currentTarget.disabled=true;
    try{const {items,failed}=await collect();if(!items.length){toast('没有可保存的曲目');return;}state.playlists.push({name:name.trim(),items});saveStore();renderFavorites();toast(`歌单已保存${failed?` · ${failed} 项未能读取`:''}`);}
    catch(error){toast(friendlyError(error));}finally{const button=node.querySelector('[data-batch="playlist"]');if(button)button.disabled=false;}
  };
  node.querySelectorAll('button[data-action]').forEach(button => button.onclick = async () => {
    const track = tracks[Number(button.dataset.index)]; const action = button.dataset.action;
    if (action === 'open') return openCollection(track);
    if (action === 'play') playTrack(track);
    if (action === 'queue') { addQueue(track); toast('已加入下载任务'); }
    if (action === 'favorite') toggleFavorite(track);
    if (action === 'switch') { button.disabled=true;try {await switchTrack(track, Number(button.dataset.index), tracks, node);}catch(error){toast(friendlyError(error));}finally{button.disabled=false;} }
    if (action === 'playlist') addToPlaylist(track);
    if (action === 'lyrics') showLyrics(track);
  });
}
function renderResults() { renderTrackCards($('#musicResults'), state.results, '输入关键词开始搜索'); }
function renderDiscoverResults() { renderTrackCards($('#musicDiscoverResults'), state.discoverResults, '选择榜单后加载内容'); }

async function switchTrack(track, index, tracks, node) {
  const sources = (state.api === API_DEFAULT ? PUBLIC_SOURCES : SOURCES.slice(1).map(item=>item[0])).filter(source=>source!==track.source);
  toast('正在寻找可用音源…');
  const query = `${track.title} ${track.artist || ''}`.trim();
  const signal = AbortSignal.timeout(8000);
  const settled = await Promise.allSettled(sources.map(source => searchSource(source, query, 'song', signal)));
  const candidates = settled.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  const score = candidate => {
    const title = String(candidate.title || '').toLowerCase(); const artist = String(candidate.artist || '').toLowerCase();
    const targetTitle = String(track.title || '').toLowerCase(); const targetArtist = String(track.artist || '').toLowerCase();
    return (title === targetTitle ? 5 : title.includes(targetTitle) || targetTitle.includes(title) ? 3 : 0) + (targetArtist && (artist.includes(targetArtist) || targetArtist.includes(artist)) ? 2 : 0) - (track.duration && candidate.duration ? Math.min(2, Math.abs(Number(track.duration) - Number(candidate.duration)) / 30) : 0);
  };
  let best;
  for (const candidate of candidates.sort((a,b) => score(b)-score(a)).filter(item => score(item) >= 2 && (!item.preview || track.preview)).slice(0,5)) {
    try { const url = await getStreamUrl(candidate, {signal:AbortSignal.timeout(6000)}); const response = await mediaFetch(url, {headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(6000)}, {mode:'auto'}); const valid = response.ok && !/text\/html|application\/json/i.test(response.headers.get('content-type') || ''); await response.body?.cancel(); if (valid) { best=candidate; break; } } catch {}
  }
  if (!best) { toast('没有找到匹配音源'); return; }
  tracks[index] = best;
  if (tracks === state.results) renderResults(); else renderTrackCards(node, tracks, '暂无内容');
  if (sameTrack(state.current, track)) playTrack(best);
  toast(`已切换到${SOURCE_NAMES[best.source] || best.source}`);
}

function coverUrl(track) {
  if (track.cover) return track.cover;
  if (track.coverEndpoint) return track.coverEndpoint;
  if (!track.picId) return '';
  if (['netease', 'qq', 'kugou', 'kuwo'].includes(track.source)) { const url = new URL(METING_API); url.searchParams.set('server', track.source); url.searchParams.set('type', 'pic'); url.searchParams.set('id', track.picId); return url.href; }
  return '';
}
async function getCoverUrl(track, signal) {
  const direct=coverUrl(track);if(direct||!track.picId)return direct;
  const api=state.api===METING_API?GD_API:state.api;
  const data=await jsonFetch(`${api}?${new URLSearchParams({types:'pic',source:track.source,id:track.picId,size:'500'})}`,signal);
  const url=httpUrl(data?.url||data?.data?.url||(typeof data==='string'?data:''));if(url)track.cover=url;return url;
}
function isFavorite(track) { return state.favorites.some(item => sameTrack(item, track)); }
function toggleFavorite(track) { const index = state.favorites.findIndex(item => sameTrack(item, track)); if (index >= 0) state.favorites.splice(index, 1); else state.favorites.push(track); saveStore(); renderResults(); renderDiscoverResults(); renderFavorites(); }
function addToPlaylist(track) {
  if (!state.playlists.length) { const name = prompt('歌单名称'); if (!name?.trim()) return; state.playlists.push({name: name.trim(), items: []}); }
  const name = prompt(`加入歌单：${state.playlists.map(item => item.name).join('、')}`, state.playlists[0].name); const list = state.playlists.find(item => item.name === name?.trim());
  if (!list) return; if (!list.items.some(item => sameTrack(item, track))) list.items.push(track); saveStore(); renderFavorites(); toast(`已加入「${list.name}」`);
}

async function getStreamUrl(track, {refresh = false, signal} = {}) {
  if (track.source === 'local') { const local=resolveTrack(track); if (!local) throw Error('本地文件已移除，请重新导入'); return local.url; }
  if (refresh && !['apple','direct'].includes(track.source) && track.streamEndpoint) track.streamUrl = '';
  if (refresh && !track.streamEndpoint && !['apple','direct'].includes(track.source) && SOURCES.some(([id])=>id===track.source)) track.streamUrl = '';
  if (track.streamUrl) return track.streamUrl;
  if (track.nativeSong && NATIVE_SOURCES.includes(track.source)) {
    const result=await nativeCall({op:'resolve',source:track.source==='5sing'?'fivesing':track.source,cookie:state.cookies[track.source]||'',quality:state.quality,song:nativeSong(track)},{signal,timeout:30000});
    const resolved=httpUrl(result?.url);
    if (resolved) { track.streamUrl=resolved;track.nativeStream=true;return resolved; }
  }
  const candidates = [];
  if (track.streamEndpoint && !refresh) candidates.push(track.streamEndpoint);
  const params = new URLSearchParams({types: 'url', source: track.source, id: track.urlId || track.id, br: state.quality});
  if (state.api !== METING_API) candidates.push(`${state.api}?${params}`);
  candidates.push(`${GD_API}?${params}`);
  let lastError;
  for (const endpoint of [...new Set(candidates)]) {
    signal?.throwIfAborted();
    try {
      const data = await textFetch(endpoint, signal);
      const url = httpUrl(data?.url || data?.data?.url || data?.audio || (typeof data === 'string' ? data : ''));
      if (url) { track.streamUrl = url; return url; }
    } catch (error) { if (signal?.aborted) throw error; lastError = error; }
  }
  throw lastError || Error('没有找到可用音频流');
}
async function getLyrics(track) {
  if (track.source === 'local') return resolveTrack(track)?.lyrics || '';
  if (track.nativeSong && NATIVE_SOURCES.includes(track.source)) {
    try { const result=await nativeCall({op:'lyrics',source:track.source==='5sing'?'fivesing':track.source,cookie:state.cookies[track.source]||'',song:nativeSong(track)},{timeout:30000}); if(typeof result==='string'&&result.trim()) return result; } catch {}
  }
  if (track.lyricEndpoint) { try { const data=await textFetch(track.lyricEndpoint); return data?.lyric || data?.lrc || (typeof data === 'string' ? data : ''); } catch {} }
  let data;
  if (['netease', 'qq', 'kugou', 'kuwo'].includes(track.source)) { const url = new URL(METING_API); url.searchParams.set('server', track.source); url.searchParams.set('type', 'lrc'); url.searchParams.set('id', track.lyricId || track.id); data = await textFetch(url.href); }
  else {
    const params = new URLSearchParams({types: 'lyric', source: track.source, id: track.lyricId || track.id}); let lastError;
    for (const api of [...new Set([state.api !== METING_API ? state.api : GD_API, GD_API])]) { try { data = await jsonFetch(`${api}?${params}`); if (data?.lyric || data?.lrc || (typeof data === 'string' && data.trim())) break; } catch (error) { lastError = error; } }
    if (!data && lastError) throw lastError;
  }
  return data?.lyric || data?.lrc || (typeof data === 'string' ? data : '');
}
let playbackRequest = 0;
async function playTrack(track) {
  track = resolveTrack(track);
  if (!track) { toast('本地文件已移除，请重新导入'); return; }
  const request = ++playbackRequest;
  const audio = $('#musicAudio');
  let failure;
  for (let attempt = 0; attempt < (track.source === 'local' ? 1 : 2); attempt++) {
    try {
      const url = await getStreamUrl(track, {refresh: attempt > 0});
      if (request !== playbackRequest) return;
      let playable=url;
      if(track.nativeStream){const blob=await nativeMediaFetch(url,{signal:AbortSignal.timeout(30000)}).then(response=>{if(!response.ok)throw Error(`音频请求失败（HTTP ${response.status}）`);return response.blob();});playable=URL.createObjectURL(blob);track.playableObjectUrl=playable;}
      if (audio.src !== playable) audio.src = playable;
      await audio.play();
      if (request !== playbackRequest) return;
      state.current = track;
      $('#musicNowTitle').textContent = track.title;
      $('#musicNowArtist').textContent = `${track.artist || ''}${track.album ? ` · ${track.album}` : ''}`;
      const cover = coverUrl(track); $('#musicCoverArt').hidden = !cover;
      if(!cover&&track.picId)getCoverUrl(track).then(url=>{if(url&&request===playbackRequest){$('#musicCoverArt').src=url;$('#musicCoverArt').hidden=false;}}).catch(()=>{});
      if (cover) $('#musicCoverArt').src = cover;
      $('#musicPlay').textContent = 'Ⅱ';
      if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:track.album,artwork:cover ? [{src:cover}] : []}); } catch {} }
      return;
    } catch (error) {
      if (request !== playbackRequest) return;
      failure = error;
      if (error.name === 'NotAllowedError') break;
    }
  }
  if (request === playbackRequest) { $('#musicPlay').textContent = '▶'; toast(friendlyError(failure)); }
}
$('#musicPlay').onclick = async () => {
  const audio = $('#musicAudio');
  if (!audio.src) return playTrack(state.results[0] || state.discoverResults[0] || state.library[0]);
  if (audio.paused) { try { await audio.play(); } catch (error) { toast(friendlyError(error)); } }
  else { ++playbackRequest; audio.pause(); }
};
$('#musicAudio').onplay = () => { $('#musicPlay').textContent = 'Ⅱ'; };
$('#musicAudio').onpause = () => { $('#musicPlay').textContent = '▶'; };
$('#musicAudio').volume = Number($('#musicVolume').value);
const playQueueOffset = direction => {
  const lists = [state.queue, state.results.filter(row=>!row.kind), state.discoverResults.filter(row=>!row.kind), state.library, state.favorites, ...state.playlists.map(row=>row.items)];
  const list = lists.find(items => items.some(item => sameTrack(item, state.current))) || lists.find(items => items.length) || [];
  const current = list.findIndex(item => sameTrack(item, state.current));
  const index = state.playMode === 'shuffle' && list.length > 1 ? (current + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length : current < 0 ? (direction > 0 ? 0 : list.length - 1) : (current + direction + list.length) % list.length;
  if (list[index]) playTrack(list[index]);
};
$('#musicPrev').onclick = () => playQueueOffset(-1); $('#musicNext').onclick = () => playQueueOffset(1); $('#musicAudio').onended = () => state.playMode === 'single' ? playTrack(state.current) : playQueueOffset(1);
document.addEventListener('keydown', event => {
  if(!panel.hidden&&event.key==='Escape'){const overlay=$('#musicEditor')||$('#musicLyricsBox');if(overlay){overlay.remove();return;}}
  if (panel.hidden || event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
  if (event.code === 'Space') { event.preventDefault(); $('#musicPlay').click(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); playQueueOffset(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); playQueueOffset(-1); }
  if (event.key.toLowerCase() === 'm') { const audio = $('#musicAudio'); audio.muted = !audio.muted; toast(audio.muted ? '已静音' : '已取消静音'); }
});

let lyricRows=[], lyricTrack=null, activeLyric=-1;
function showLyrics(track) {
  $('#musicLyricsBox')?.remove(); const box=document.createElement('section');box.id='musicLyricsBox';box.className='music-lyrics';
  box.innerHTML=`<div><strong>${escapeHtml(track.title)}</strong><button aria-label="关闭歌词">×</button></div><div class="music-lyric-lines">正在读取歌词…</div>`;
  panel.append(box);box.querySelector('button').onclick=()=>{box.remove();lyricRows=[];lyricTrack=null;};
  getLyrics(track).then(text=>{
    if(!box.isConnected)return;lyricRows=parseLrc(text);lyricTrack=track;activeLyric=-1;
    const lines=box.querySelector('.music-lyric-lines');
    lines.innerHTML=lyricRows.length?lyricRows.map((row,index)=>`<button data-lyric="${index}">${escapeHtml(row.text)||'♪'}</button>`).join(''):`<pre>${escapeHtml(text||'暂无歌词')}</pre>`;
    lines.querySelectorAll('[data-lyric]').forEach(button=>button.onclick=()=>{if(sameTrack(state.current,track))$('#musicAudio').currentTime=lyricRows[Number(button.dataset.lyric)].time;else playTrack(track);});
  }).catch(error=>{box.querySelector('.music-lyric-lines').textContent=friendlyError(error);});
}
const audio=$('#musicAudio');
const updateTimeline=()=>{
  const duration=audio.duration,time=audio.currentTime;
  $('#musicElapsed').textContent=formatTime(time)||'0:00';$('#musicDuration').textContent=formatTime(duration)||'0:00';
  $('#musicSeek').value=Number.isFinite(duration)&&duration>0?String(time/duration*1000):'0';
  if(lyricRows.length&&sameTrack(lyricTrack,state.current)){
    const index=lyricRows.findLastIndex(row=>row.time<=time);
    if(index!==activeLyric){activeLyric=index;$$('[data-lyric]').forEach(button=>button.classList.toggle('active',Number(button.dataset.lyric)===index));const line=$(`[data-lyric="${index}"]`),container=line?.parentElement;if(line&&container)container.scrollTop=Math.max(0,line.offsetTop-container.offsetTop-container.clientHeight/2+line.clientHeight/2);}
  }
};
audio.addEventListener('timeupdate',updateTimeline);audio.addEventListener('loadedmetadata',updateTimeline);
$('#musicSeek').oninput=event=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(event.target.value)/1000;};
function updatePlayMode(){const labels={list:['↻','列表循环'],single:['↺','单曲循环'],shuffle:['⤨','随机播放']};const button=$('#musicPlayMode');button.textContent=labels[state.playMode][0];button.title=labels[state.playMode][1];button.setAttribute('aria-label',labels[state.playMode][1]);}
$('#musicPlayMode').onclick=()=>{state.playMode={list:'single',single:'shuffle',shuffle:'list'}[state.playMode];updatePlayMode();saveStore();};updatePlayMode();
if('mediaSession' in navigator){for(const[action,handler]of Object.entries({play:()=>{if(audio.src)audio.play().catch(error=>toast(friendlyError(error)));else $('#musicPlay').click();},pause:()=>audio.pause(),previoustrack:()=>playQueueOffset(-1),nexttrack:()=>playQueueOffset(1),seekto:details=>{if(Number.isFinite(details.seekTime))audio.currentTime=details.seekTime;},seekbackward:()=>{audio.currentTime=Math.max(0,audio.currentTime-10);},seekforward:()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+10);}})){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}}

function addQueue(track, render=true) { track=resolveTrack(track); if (!track || state.queue.some(item => sameTrack(item, track) && !['error', 'complete'].includes(item.status))) return; state.queue.push({...track, status: 'waiting', progress: 0, error: ''}); if(render)renderQueue(); }
function updateQueueCount() { const count = state.queue.filter(item => !['complete'].includes(item.status)).length; $('#musicQueueCount').textContent = count || ''; $('#musicQueueSummary').textContent = `${state.queue.length} 项`; }
function renderQueue() { const node = $('#musicQueue'); updateQueueCount(); if (!state.queue.length) { node.innerHTML = '<div class="music-empty">还没有下载任务</div>'; return; } node.innerHTML = state.queue.map((item, index) => `<div class="music-task"><div class="music-task-art">${coverUrl(item) ? `<img src="${escapeHtml(item.cover || coverUrl(item))}" alt="">` : '♪'}</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.artist || SOURCE_NAMES[item.source] || '')}</span><div class="music-progress"><i style="width:${Math.min(100,Math.max(0,Math.round(item.progress || 0)))}%"></i></div><small>${item.status === 'complete' ? `已完成${item.warning ? ' · ' + escapeHtml(item.warning) : ''}` : item.status === 'running' ? `下载中 ${Math.min(100,Math.max(0,Math.round(item.progress || 0)))}%${item.speed ? ' · '+formatBytes(item.speed)+'/s' : ''}` : ['error','paused'].includes(item.status) ? escapeHtml(item.error) : '等待中'}</small></div><button data-remove-task="${index}" aria-label="移除" ${item.status === 'running' ? 'disabled' : ''}>×</button></div>`).join(''); node.querySelectorAll('[data-remove-task]').forEach(button => button.onclick = () => { state.queue.splice(Number(button.dataset.removeTask), 1); renderQueue(); }); }
async function transcode(blob, inputExt, target, bitrate, track, {signal, lyrics = '', cover} = {}) {
  if (target === 'source' && !state.embedTags) return blob;
  const format = target === 'source' ? inputExt : target;
  signal?.throwIfAborted();
  const worker = new Worker(new URL('./assets/ffmpeg-worker.js', import.meta.url));
  let sequence = 0;
  const pending = new Map();
  const rejectAll = error => { for (const {reject, timer} of pending.values()) { clearTimeout(timer); reject(error); } pending.clear(); };
  const abort = () => { rejectAll(signal.reason || new DOMException('已取消', 'AbortError')); worker.terminate(); };
  signal?.throwIfAborted(); signal?.addEventListener('abort', abort, {once: true});
  worker.onerror = event => rejectAll(Error(event.message || '音频转换引擎异常'));
  worker.onmessage = event => {
    const {id, type, data} = event.data || {}; const callback = pending.get(id);
    if (!callback) return;
    clearTimeout(callback.timer); pending.delete(id);
    type === 'ERROR' ? callback.reject(Error(String(data))) : callback.resolve(data);
  };
  const call = (type, data, transfer = []) => new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const id = String(++sequence);
    const timer = setTimeout(() => { pending.delete(id); reject(Error('音频转换超时，请重试')); worker.terminate(); }, type === 'EXEC' ? 600000 : 120000);
    pending.set(id, {resolve, reject, timer}); worker.postMessage({id, type, data}, transfer);
  });
  try {
    const input = `/input.${inputExt || 'bin'}`, output = `/output.${format}`;
    await call('LOAD', {coreURL: new URL('../studio/runtime/ffmpeg/ffmpeg-core.js', import.meta.url).href, wasmURL: new URL('../studio/runtime/ffmpeg/ffmpeg-core.wasm', import.meta.url).href});
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await call('WRITE_FILE', {path: input, data: bytes}, [bytes.buffer]);
    let coverPath = '';
    if (cover && state.embedTags && ['mp3','flac','m4a'].includes(format)) {
      coverPath = '/cover.jpg'; const bytes = new Uint8Array(await cover.arrayBuffer());
      await call('WRITE_FILE', {path: coverPath, data: bytes}, [bytes.buffer]);
    }
    const args = transcodeArgs({input, output, format, bitrate, track: state.embedTags ? track : undefined, lyrics: state.embedTags ? lyrics : '', cover: coverPath,copyAudio:target==='source'});
    const code = await call('EXEC', {args});
    if (code !== 0) throw Error(`音频转换失败（${code}）`);
    const result = await call('READ_FILE', {path: output});
    const outputBlob=new Blob([result], {type: format === 'mp3' ? 'audio/mpeg' : format === 'flac' ? 'audio/flac' : format === 'wav' ? 'audio/wav' : blob.type});
    return state.embedTags && format==='mp3' && lyrics ? embedMp3Lyrics(outputBlob,lyrics) : outputBlob;
  } finally { signal?.removeEventListener('abort', abort); rejectAll(new DOMException('转换已结束', 'AbortError')); worker.terminate(); }
}
async function fetchBlob(url, onProgress, signal, task) {
  let saved=task?.partial;
  if(saved && saved.url!==url){delete task.partial;saved=null;}
  let offset=saved?.blob?.size||0;
  const headers={};if(offset&&saved.validator){headers.Range=`bytes=${offset}-`;headers['If-Range']=saved.validator;}
  else offset=0;
  let response=task?.nativeStream?await nativeMediaFetch(url,{headers,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(180000)]):AbortSignal.timeout(180000)}):await mediaFetch(url,{headers,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(180000)]):AbortSignal.timeout(180000)},{mode:'auto'});
  if(offset&&response.status===416){await response.body?.cancel();delete task.partial;return fetchBlob(url,onProgress,signal,task);}
  if(!response.ok)throw Error(`音频请求失败（HTTP ${response.status}）`);
  const type=response.headers.get('content-type')||'application/octet-stream';
  if(/text\/html|application\/json/i.test(type)){await response.body?.cancel();throw Error('音源返回了错误页面，请换源后重试');}
  const range=response.headers.get('content-range')?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  const etag=response.headers.get('etag')||'',validator=(etag&&!etag.startsWith('W/')?etag:response.headers.get('last-modified'))||'';
  if(offset&&response.status===206&&(!range||Number(range[1])!==offset||(validator&&validator!==saved.validator))){await response.body?.cancel();delete task.partial;return fetchBlob(url,onProgress,signal,task);}
  const resumed=offset&&response.status===206;
  const chunks=resumed?[saved.blob]:[];let received=resumed?offset:0;
  const total=range?Number(range[3]):Number(response.headers.get('content-length'))||0;
  const reader=response.body?.getReader();if(!reader)return response.blob();
  const started=performance.now(),initial=received;
  try{
    while(true){signal?.throwIfAborted();const part=await reader.read();if(part.done)break;chunks.push(part.value);received+=part.value.byteLength;
      if(task){task.speed=(received-initial)/Math.max(.001,(performance.now()-started)/1000);task.received=received;task.total=total;}
      onProgress?.(total?received/total*100:0);
    }
    if(total&&received<total)throw Error('音频下载中断，可继续下载');
  }catch(error){if(task&&validator&&received&&(!response.headers.get('content-encoding')||response.headers.get('content-encoding')==='identity'))task.partial={url,validator,blob:new Blob(chunks,{type})};await reader.cancel().catch(()=>{});throw error;}
  finally{reader.releaseLock();}
  if(task)delete task.partial;
  return new Blob(chunks,{type});
}

let downloadDirectory;
$('#musicDirectory').hidden=typeof window.showDirectoryPicker!=='function';
$('#musicDirectory').onclick=async()=>{try{downloadDirectory=await window.showDirectoryPicker({mode:'readwrite'});$('#musicDirectoryName').textContent=downloadDirectory.name;}catch(error){if(error.name!=='AbortError')toast(friendlyError(error));}};
$('#musicDirectoryReset').onclick=()=>{downloadDirectory=null;$('#musicDirectoryName').textContent='浏览器下载';};
async function saveMusicFile(blob,name,signal,warnings){
  signal?.throwIfAborted();
  if(downloadDirectory){const handle=await downloadDirectory.getFileHandle(name,{create:true});const stream=await handle.createWritable();try{await stream.write(blob);signal?.throwIfAborted();await stream.close();}catch(error){await stream.abort().catch(()=>{});throw error;}}
  else download(blob,name);
  if($('#musicDavEnabled').checked){
    try{
      const base=httpUrl($('#musicDavUrl').value.trim());if(!base)throw Error('WebDAV 地址无效');
      const target=new URL(base);if(target.search||target.hash)throw Error('WebDAV 目录不能包含查询参数');target.pathname=target.pathname.replace(/\/?$/,'/')+encodeURIComponent(name);
      const headers={'Content-Type':blob.type||'application/octet-stream'},user=$('#musicDavUser').value,password=$('#musicDavPassword').value;
      if(user||password)headers.Authorization='Basic '+btoa(String.fromCharCode(...new TextEncoder().encode(`${user}:${password}`)));
      const response=await fetch(target.href,{method:'PUT',headers,body:blob,credentials:'omit',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(180000)]):AbortSignal.timeout(180000)});
      if(!response.ok)throw Error(`HTTP ${response.status}`);await response.body?.cancel();
    }catch(error){signal?.throwIfAborted();warnings.push('WebDAV 同步失败');}
  }
}
let queueController;
let progressFrame = 0;
function scheduleQueueRender() { if (!progressFrame) progressFrame = requestAnimationFrame(() => { progressFrame = 0; renderQueue(); }); }
async function downloadTrack(item, signal) {
  item.status = 'running'; item.progress = 0; item.error = ''; item.warning = ''; renderQueue();
  try {
    const url = await getStreamUrl(item, {signal});
    const source = item.source === 'local' ? resolveTrack(item)?.file : await fetchBlob(url, value => { item.progress = value * .8; scheduleQueueRender(); }, signal, item);
    const ext = audioExtension(source, url, item.ext);
    const warnings = [];
    let lyric = '', cover;
    if (state.withLyrics || state.embedTags) { try { lyric = await getLyrics(item); } catch { warnings.push('歌词未获取'); } }
    if (state.withCover || state.embedTags) { try { const art=await getCoverUrl(item,signal);if(item.source==='local'&&resolveTrack(item)?.coverFile)cover=resolveTrack(item).coverFile;else if(art)cover = await fetchBlob(art, null, signal); } catch (error) { signal?.throwIfAborted(); warnings.push('封面未获取'); } }
    const blob = await transcode(source, ext, state.format, state.quality, item, {signal, lyrics: lyric, cover});
    signal?.throwIfAborted();
    const base = safeName(state.filename.replace(/\{(title|artist|album|source|id)\}/g, (_,key)=>item[key] || '').replace(/^\s*-\s*|\s*-\s*$/g,'')), extension = state.format === 'source' ? ext : state.format;
    await saveMusicFile(blob, `${base}.${extension}`,signal,warnings);
    if (state.withMeta) await saveMusicFile(new Blob([JSON.stringify({title: item.title, artist: item.artist, album: item.album, source: item.source, id: item.id, url: item.webpage_url || ''}, null, 2)], {type: 'application/json'}), `${base}.info.json`,signal,warnings);
    if (state.withCover && cover) await saveMusicFile(cover, `${base}.jpg`,signal,warnings);
    if (state.withLyrics && lyric) await saveMusicFile(new Blob([lyric], {type: 'text/plain;charset=utf-8'}), `${base}.lrc`,signal,warnings);
    item.status = 'complete'; item.progress = 100; item.warning = warnings.join(' · ');
  } catch (error) { item.status = signal?.aborted ? 'paused' : 'error'; item.error = signal?.aborted ? '已暂停，可继续下载' : friendlyError(error); }
  renderQueue();
}
$('#musicStartQueue').onclick = async () => {
  if (state.processing) return;
  state.processing = true; queueController = new AbortController();
  $('#musicStartQueue').disabled = true; $('#musicStopQueue').disabled = false;$$('[data-view="settings"] input,[data-view="settings"] select,[data-view="settings"] button').forEach(node=>node.disabled=true);
  try {
    for (const item of [...state.queue]) { if (queueController.signal.aborted) break; if (item.status === 'complete' || !state.queue.includes(item)) continue; await downloadTrack(item, queueController.signal); }
    const failed = state.queue.filter(item => item.status === 'error').length;
    recordToolUse('yt-dlp'); toast(queueController.signal.aborted ? '已停止' : failed ? `${failed} 项失败，可换源后重试` : '下载任务已完成');
  } finally { state.processing = false; queueController = null; $('#musicStartQueue').disabled = false; $('#musicStopQueue').disabled = true;$$('[data-view="settings"] input,[data-view="settings"] select,[data-view="settings"] button').forEach(node=>node.disabled=false); }
};
$('#musicStopQueue').onclick = () => queueController?.abort();
$('#musicClearQueue').onclick = () => { state.queue = state.queue.filter(item => item.status !== 'complete'); renderQueue(); };

function flatten(items) { const out = []; const walk = item => { if (!item) return; if (Array.isArray(item.entries)) item.entries.forEach(walk); else out.push(item); }; items.forEach(walk); return out; }
async function inspectMediaUrls(urls) { return new Promise((resolve, reject) => { const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'}); const timer = setTimeout(() => { worker.terminate(); reject(Error('解析超时')); }, 180000); worker.onmessage = event => { const data = event.data; if (data.type === 'status') status('#musicLinkStatus', data.text); if (data.type === 'error') { clearTimeout(timer); worker.terminate(); reject(Error(data.text)); } if (data.type === 'result') { clearTimeout(timer); worker.terminate(); resolve(flatten(data.data).map(item => normaliseTrack({...item, title: item.title, urlId: item.id, source: item.extractor || 'yt-dlp'}, item.extractor || 'yt-dlp'))); } }; worker.onerror = event => { clearTimeout(timer); worker.terminate(); reject(event.error || Error('下载引擎异常')); }; worker.postMessage({type: 'inspect', urls, playlist: true, timeout: 60, options: {format: 'bestaudio/best'}, network: {mode: 'auto'}}); }); }
async function inspectUrls(urls) {
  const tracks = [], media = [], failures = [];
  for (const url of urls) {
    try {
    if (!httpUrl(url)) throw Error('链接无效');
    const link = parseMusicLink(url);
    const nativeSource=(()=>{try{const host=new URL(url).hostname;const rows=[['netease',['music.163.com','music.126.net']],['qq',['y.qq.com','qq.com']],['kugou',['kugou.com']],['kuwo',['kuwo.cn','kuwo.com']],['migu',['migu.cn','migu.com']],['bilibili',['bilibili.com','b23.tv']],['joox',['joox.com']],['qianqian',['91q.com']],['5sing',['5sing.kugou.com']],['jamendo',['jamendo.com']],['spotify',['spotify.com']]];return rows.find(([,domains])=>domains.some(d=>host===d||host.endsWith('.'+d)))?.[0]||'';}catch{return '';}})();
    if(nativeSource&&NATIVE_SOURCES.includes(nativeSource)){
      const type=link?.type||(/\/playlist|\/list|disstid=/.test(url)?'playlist':/\/album|albumid=/.test(url)?'album':'song');
      const result=await nativeCall({op:type==='playlist'?'parse-playlist':type==='album'?'parse-album':'parse',source:nativeSource==='5sing'?'fivesing':nativeSource,cookie:state.cookies[nativeSource]||'',url},{timeout:30000});
      const songs=result?.songs||[result];tracks.push(...songs.map(row=>normaliseTrack({...row,title:row.title||row.name,nativeSong:row},nativeSource)).filter(Boolean));continue;
    }
    if (['netease','qq','kugou','kuwo'].includes(link?.source)) {
      if (link.type !== 'song') tracks.push(...await readCollection(link, AbortSignal.timeout(15000)));
      else {
        const endpoint = new URL(METING_API); endpoint.searchParams.set('server',link.source); endpoint.searchParams.set('type','song'); endpoint.searchParams.set('id',link.id);
        tracks.push(...parseSearchData(await jsonFetch(endpoint.href), link.source));
      }
    } else if (/\.(mp3|wav|flac|m4a|ogg|aac|opus|webm)(?:[?#]|$)/i.test(url)) { const u=new URL(url); tracks.push(normaliseTrack({id:u.href,title:decodeURIComponent(u.pathname.split('/').pop()),url:u.href},'direct')); }
    else media.push(url);
    } catch(error) { failures.push(friendlyError(error)); }
  }
  if (media.length) { try { tracks.push(...await inspectMediaUrls(media)); } catch(error) { failures.push(friendlyError(error)); } }
  if (!tracks.length) throw Error(failures.join('；') || '未解析到可下载曲目');
  if(failures.length)toast(`${failures.length} 个链接未成功，其余已加入任务`);
  return tracks.filter(Boolean);
}
$('#musicInspect').onclick = async () => { const urls = $('#musicUrls').value.split(/\r?\n/).map(value => value.trim()).filter(Boolean); if (!urls.length) { status('#musicLinkStatus', '请先粘贴链接'); return; } const button = $('#musicInspect'); button.disabled = true; status('#musicLinkStatus', '正在解析…'); try { const items = await inspectUrls(urls); items.forEach(track=>addQueue(track,false));renderQueue(); status('#musicLinkStatus', `已加入 ${items.length} 项`); showTab('queue'); recordToolUse('yt-dlp'); } catch (error) { status('#musicLinkStatus', friendlyError(error)); } finally { button.disabled = false; } };
$('#musicPaste').onclick = async () => { try { $('#musicUrls').value = await navigator.clipboard.readText(); } catch { status('#musicLinkStatus', '无法读取剪贴板，请手动粘贴'); } };

function localId() { return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function localItem(file,id=localId(),meta={}) {return {id,title:meta.title||file.name.replace(/\.[^.]+$/,''),artist:meta.artist||'本地文件',album:meta.album||'',lyrics:meta.lyrics||'',coverFile:meta.coverFile,cover:meta.coverFile?URL.createObjectURL(meta.coverFile):'',source:'local',file,size:file.size,type:file.type,url:URL.createObjectURL(file)};}
function openLibraryDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(Error('当前浏览器不支持本地音乐存储'));
    const request = indexedDB.open(LIBRARY_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', {keyPath: 'id'});
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error || Error('无法打开本地音乐库'));
  });
}
async function putLibraryFile(item) { const db = await openLibraryDb(); await new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put({id:item.id,name:item.file.name,file:item.file,title:item.title,artist:item.artist,album:item.album,lyrics:item.lyrics||'',coverFile:item.coverFile}); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); }
async function deleteLibraryFile(id) { const db = await openLibraryDb(); await new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); }
async function loadLibrary() { try { const db = await openLibraryDb(); const rows = await new Promise((resolve, reject) => { const tx = db.transaction('files', 'readonly'); const request = tx.objectStore('files').getAll(); request.onsuccess = () => resolve(request.result || []); request.onerror = () => reject(request.error); }); db.close(); state.library = rows.filter(row => row.file).map(row => localItem(row.file,row.id,row));state.favorites=state.favorites.map(row=>resolveTrack(row)||row);state.playlists.forEach(list=>{list.items=list.items.map(row=>resolveTrack(row)||row);});renderLibrary();renderFavorites(); } catch {} }
async function addLocalFiles(input) { const selected=[...input]; await libraryReady; const files = selected.filter(file => file.type.startsWith('audio/') || /\.(flac|m4a|wav|ogg|aac|mp3|wma)$/i.test(file.name)); if (!files.length) return; for (const file of files) { const item = localItem(file); state.library.push(item); try { await putLibraryFile(item); } catch { toast('浏览器存储不足，文件仅本次可用'); } } renderLibrary(); recordToolUse('yt-dlp'); }
async function removeLocalFile(index) {
  const item=state.library[index];if(!item)return;
  if(state.queue.some(row=>sameTrack(row,item)&&row.status==='running')){toast('请先停止该文件的转换任务');return;}
  try{await deleteLibraryFile(item.id);}catch{toast('无法删除浏览器中的文件，请重试');return;}
  if(sameTrack(state.current,item)){++playbackRequest;audio.pause();audio.removeAttribute('src');audio.load();state.current=null;$('#musicNowTitle').textContent='未选择歌曲';$('#musicNowArtist').textContent='';$('#musicCoverArt').hidden=true;}
  if(!state.library.includes(item))return;
  URL.revokeObjectURL(item.url);if(item.cover)URL.revokeObjectURL(item.cover);state.library.splice(state.library.indexOf(item),1);
  state.favorites=state.favorites.filter(row=>!sameTrack(row,item));state.playlists.forEach(list=>{list.items=list.items.filter(row=>!sameTrack(row,item));});state.queue=state.queue.filter(row=>!sameTrack(row,item));saveStore();renderLibrary();renderQueue();renderFavorites();
}
$('#musicFiles').onchange = event => { addLocalFiles(event.target.files); event.target.value = ''; };
const libraryDrop = $('.music-drop'); ['dragenter', 'dragover'].forEach(type => libraryDrop.addEventListener(type, event => { event.preventDefault(); libraryDrop.classList.add('dragging'); })); ['dragleave', 'drop'].forEach(type => libraryDrop.addEventListener(type, event => { event.preventDefault(); libraryDrop.classList.remove('dragging'); })); libraryDrop.addEventListener('drop', event => addLocalFiles(event.dataTransfer.files));
function renderLibrary() { const node = $('#musicLibrary'); node.innerHTML = state.library.length ? state.library.map((item, index) => `<div class="music-task"><div class="music-task-art">♪</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>本地文件 · ${formatBytes(item.size)}</span></div><button data-local-play="${index}" aria-label="播放">▶</button><button data-local-queue="${index}" aria-label="加入转换任务">＋</button><button data-local-edit="${index}" aria-label="编辑音乐信息">✎</button><button data-local-remove="${index}" aria-label="移除">×</button></div>`).join('') : '<div class="music-empty">选择音频文件后在这里播放</div>'; node.querySelectorAll('[data-local-play]').forEach(button => button.onclick = () => playTrack(state.library[Number(button.dataset.localPlay)])); node.querySelectorAll('[data-local-queue]').forEach(button => button.onclick = () => { addQueue(state.library[Number(button.dataset.localQueue)]); toast('已加入下载任务'); }); node.querySelectorAll('[data-local-edit]').forEach(button=>button.onclick=()=>editLocalTrack(state.library[Number(button.dataset.localEdit)])); node.querySelectorAll('[data-local-remove]').forEach(button => button.onclick = () => removeLocalFile(Number(button.dataset.localRemove))); }


function editLocalTrack(item){
  if(!item)return;if(state.queue.some(row=>sameTrack(row,item)&&row.status==='running')){toast('请先停止该文件的转换任务');return;}
  $('#musicEditor')?.remove();const editor=document.createElement('section');editor.id='musicEditor';editor.className='music-lyrics music-editor';
  editor.innerHTML=`<div><strong>音乐信息</strong><button type="button" aria-label="关闭编辑">×</button></div><form class="music-settings"><label>标题<input name="title" required value="${escapeHtml(item.title)}"></label><div class="music-setting-row"><label>歌手<input name="artist" value="${escapeHtml(item.artist)}"></label><label>专辑<input name="album" value="${escapeHtml(item.album)}"></label></div><label>歌词<textarea name="lyrics" class="music-textarea" placeholder="支持 LRC 时间轴">${escapeHtml(item.lyrics||'')}</textarea></label><label>封面<input name="cover" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary" type="submit">保存</button></form>`;
  panel.append(editor);editor.querySelector('[aria-label="关闭编辑"]').onclick=()=>editor.remove();
  editor.querySelector('form').onsubmit=async event=>{
    event.preventDefault();const form=event.target,button=form.querySelector('[type="submit"]');button.disabled=true;
    const data=new FormData(form),cover=data.get('cover'),next={...item,title:String(data.get('title')).trim()||item.title,artist:String(data.get('artist')).trim(),album:String(data.get('album')).trim(),lyrics:String(data.get('lyrics')),coverFile:cover?.size?cover:item.coverFile};
    try{await putLibraryFile(next);if(next.coverFile!==item.coverFile){if(item.cover)URL.revokeObjectURL(item.cover);next.cover=URL.createObjectURL(next.coverFile);}Object.assign(item,next);state.queue.forEach(row=>{if(sameTrack(row,item))Object.assign(row,item);});state.favorites=state.favorites.map(row=>sameTrack(row,item)?item:row);state.playlists.forEach(list=>{list.items=list.items.map(row=>sameTrack(row,item)?item:row);});saveStore();renderLibrary();renderFavorites();renderQueue();if(sameTrack(state.current,item)){$('#musicNowTitle').textContent=item.title;$('#musicNowArtist').textContent=item.artist;$('#musicCoverArt').hidden=!item.cover;if(item.cover)$('#musicCoverArt').src=item.cover;}editor.remove();toast('已保存');}
    catch(error){toast('浏览器未能保存音乐信息，请重试');button.disabled=false;}
  };
}

function renderFavorites() {
  const fav = $('#musicFavorites');
  fav.innerHTML = state.favorites.length ? state.favorites.map((item,index)=>`<div class="music-task"><div class="music-task-art">★</div><div class="music-task-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.artist || '')}</span></div><button data-fav-play="${index}" aria-label="播放">▶</button><button data-fav-queue="${index}" aria-label="加入任务">＋</button><button data-fav-remove="${index}" aria-label="取消收藏">×</button></div>`).join('') : '<div class="music-empty">暂无收藏</div>';
  fav.querySelectorAll('[data-fav-play]').forEach(button=>button.onclick=()=>playTrack(state.favorites[Number(button.dataset.favPlay)]));
  fav.querySelectorAll('[data-fav-queue]').forEach(button=>button.onclick=()=>addQueue(state.favorites[Number(button.dataset.favQueue)]));
  fav.querySelectorAll('[data-fav-remove]').forEach(button=>button.onclick=()=>{state.favorites.splice(Number(button.dataset.favRemove),1);saveStore();renderFavorites();renderResults();renderDiscoverResults();});
  const playlists=$('#musicPlaylists');
  playlists.innerHTML=state.playlists.map((list,index)=>`<section class="music-playlist"><div><strong>${escapeHtml(list.name)} <span>${list.items.length} 首</span></strong><div class="music-inline"><button data-list-action="queue" data-list="${index}" title="全部加入任务">＋</button><button data-list-action="rename" data-list="${index}">重命名</button><button data-list-action="export" data-list="${index}">导出</button><button data-list-action="delete" data-list="${index}" aria-label="删除歌单">×</button></div></div><div class="music-playlist-tracks">${list.items.map((item,trackIndex)=>`<div class="music-playlist-row"><button data-list-play="${index}" data-track="${trackIndex}">${escapeHtml(item.title)}<span>${escapeHtml(item.artist)}</span></button><button data-list-remove="${index}" data-track="${trackIndex}" aria-label="移出歌单">×</button></div>`).join('')}</div></section>`).join('');
  playlists.querySelectorAll('[data-list-play]').forEach(button=>button.onclick=()=>playTrack(state.playlists[Number(button.dataset.listPlay)].items[Number(button.dataset.track)]));
  playlists.querySelectorAll('[data-list-remove]').forEach(button=>button.onclick=()=>{state.playlists[Number(button.dataset.listRemove)].items.splice(Number(button.dataset.track),1);saveStore();renderFavorites();});
  playlists.querySelectorAll('[data-list-action]').forEach(button=>button.onclick=()=>{
    const index=Number(button.dataset.list),list=state.playlists[index];
    if(button.dataset.listAction==='queue'){list.items.forEach(track=>addQueue(track,false));renderQueue();toast('已加入任务');return;}
    if(button.dataset.listAction==='export'){exportPlaylists([list]);return;}
    if(button.dataset.listAction==='rename'){const name=prompt('歌单名称',list.name);if(!name?.trim())return;list.name=name.trim();}
    if(button.dataset.listAction==='delete'){if(!confirm(`删除「${list.name}」？`))return;state.playlists.splice(index,1);}
    saveStore();renderFavorites();
  });
}
function exportPlaylists(lists=state.playlists) {download(new Blob([JSON.stringify({version:1,playlists:lists.map(list=>({name:list.name,items:list.items.map(portableTrack)}))},null,2)],{type:'application/json'}),'音乐歌单.json');}
$('#musicExportPlaylists').onclick=()=>exportPlaylists();
$('#musicImportPlaylist').onclick=()=>$('#musicPlaylistFile').click();
$('#musicPlaylistFile').onchange=async event=>{
  try {
    const file=event.target.files[0];if(!file)return;
    const data=JSON.parse(await file.text());const lists=Array.isArray(data)?data:data.playlists;
    if(!Array.isArray(lists)||lists.some(list=>!list||typeof list.name!=='string'||!Array.isArray(list.items)))throw Error('歌单文件格式无效');
    const imported=lists.map(list=>({name:list.name.trim()||'导入歌单',items:list.items.map(item=>normaliseTrack(item,item?.source)).filter(Boolean).map(portableTrack)}));
    state.playlists.push(...imported);saveStore();renderFavorites();toast(`已导入 ${imported.length} 个歌单`);
  }catch(error){toast(error instanceof SyntaxError?'无法读取歌单文件':friendlyError(error));}finally{event.target.value='';}
};
$('#musicNewPlaylist').onclick=()=>{const name=prompt('歌单名称');if(!name?.trim())return;state.playlists.push({name:name.trim(),items:[]});saveStore();renderFavorites();};

$('#musicSaveSettings').onclick = () => { const api=$('#musicApi').value.trim(); if (api && !httpUrl(api)) { toast('请输入有效的 HTTP 或 HTTPS 接口'); return; } state.api = api || API_DEFAULT; state.filename=$('#musicFilename').value.trim() || '{artist} - {title}'; state.format = $('#musicFormat').value; state.quality = $('#musicQuality').value; state.withMeta = $('#musicMeta').checked; state.withCover = $('#musicCover').checked; state.withLyrics = $('#musicLyrics').checked; state.embedTags = $('#musicEmbed').checked; saveStore(); toast('设置已保存'); };
$('#musicLoginSource').onchange=()=>{const source=$('#musicLoginSource').value;$('#musicCookie').value=state.cookies[source]||'';};
$('#musicCookie').oninput=event=>{const source=$('#musicLoginSource').value;state.cookies[source]=event.target.value.trim();try{sessionStorage.setItem('pocket-music-cookies',JSON.stringify(state.cookies));}catch{}};
let loginController;
$('#musicLogin').onclick=async()=>{
  const source=$('#musicLoginSource').value,loginType=$('#musicLoginType').value,button=$('#musicLogin');button.disabled=true;loginController?.abort();loginController=new AbortController();
  const box=$('#musicLoginQr');box.hidden=false;box.innerHTML='<span class="music-login-loading">正在生成登录码…</span>';status('#musicLoginStatus','');
  try{
    const session=await nativeCall({op:'qr-create',source,loginType},{signal:loginController.signal,timeout:30000});
    const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(session.url)}`;
    box.innerHTML=`<img src="${qrUrl}" alt="登录二维码"><a href="${escapeHtml(session.url)}" target="_blank" rel="noopener">打开登录页</a>`;status('#musicLoginStatus','请扫码后等待');
    const deadline=Date.now()+Math.min(300000,Math.max(30000,(Number(session.expires_at||0)*1000-Date.now())||300000));
    while(Date.now()<deadline){await new Promise(resolve=>setTimeout(resolve,2200));loginController.signal.throwIfAborted();const result=await nativeCall({op:'qr-check',source,loginType,id:session.key},{signal:loginController.signal,timeout:20000});if(result.status==='success'&&result.cookie){state.cookies[source]=result.cookie;try{sessionStorage.setItem('pocket-music-cookies',JSON.stringify(state.cookies));}catch{}$('#musicCookie').value=result.cookie;status('#musicLoginStatus','已登录');toast('平台登录已保存');break;}if(result.status==='expired'){status('#musicLoginStatus','登录码已过期');break;}status('#musicLoginStatus',result.status==='scanned'?'已扫码，确认中…':'等待扫码…');}
  }catch(error){if(error.name!=='AbortError')status('#musicLoginStatus',friendlyError(error));}
  finally{button.disabled=false;loginController=null;}
};
$('#musicCookie').value=state.cookies[$('#musicLoginSource').value]||'';
renderResults(); renderQueue(); renderFavorites(); renderLibrary(); const libraryReady = loadLibrary();
