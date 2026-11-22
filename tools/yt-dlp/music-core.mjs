export function httpUrl(value) {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}

export function normaliseTrack(item, sourceHint = 'netease') {
  if (!item || typeof item !== 'object') return null;
  const endpoint = value => {
    const url = httpUrl(value);
    return url && /(?:meting\/api|api\.php)/i.test(url) ? url : '';
  };
  const rawArtist = item.artist || item.artists || item.ar;
  const artist = Array.isArray(rawArtist) ? rawArtist.map(value => typeof value === 'object' ? value.name : value).join(' / ') : (rawArtist?.name || rawArtist || item.author || item.uploader || '');
  const source = item.source || sourceHint;
  const title = item.title || item.name || item.songname || '';
  if (!title) return null;
  let endpointId = '';
  try { endpointId = new URL(item.url).searchParams.get('id') || ''; } catch {}
  const id = String(item.id ?? item.songid ?? item.url_id ?? item.urlId ?? (endpointId || `${title}-${artist}`));
  const streamUrl = httpUrl(item.streamUrl || item.url);
  const audioFormat = item.requested_formats?.find(format => format.vcodec === 'none' && format.url) || item.formats?.findLast(format => format.vcodec === 'none' && format.url);
  return {
    ...item, id, source, title, artist,
    album: typeof item.album === 'object' ? item.album?.name || '' : item.album || item.al?.name || '',
    picId: item.pic_id || item.picId || '',
    cover: httpUrl(item.pic_url || item.cover || item.album?.picUrl || item.al?.picUrl || (!endpoint(item.pic) ? item.pic : '') || item.thumbnail),
    coverEndpoint: endpoint(item.pic), lyricEndpoint: endpoint(item.lrc),
    urlId: String(item.url_id || item.urlId || id), lyricId: String(item.lyric_id || item.lyricId || id),
    streamUrl: audioFormat?.url || (!endpoint(streamUrl) ? streamUrl : ''),
    streamEndpoint: endpoint(item.url),
    duration: Number((item.duration && (item.bMusic || item.hMusic || item.mp3Url) ? item.duration / 1000 : item.duration) || (item.dt || item.duration_ms || 0) / 1000), ext: audioFormat?.ext || item.ext || ''
  };
}

export function parseSearchData(data, source) {
  const candidates = [data, data?.data, data?.data?.songs, data?.data?.list, data?.result?.songs, data?.songs, data?.album?.songs, data?.playlist?.tracks];
  return (candidates.find(Array.isArray) || []).map(item => normaliseTrack(item, source)).filter(Boolean);
}

export function parseMusicLink(input) {
  let url;
  try { url = new URL(input.trim()); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  const path = `${url.pathname}${url.hash.replace(/^#/, '')}`;
  const id = url.searchParams.get('id') || new URLSearchParams(url.hash.split('?')[1]).get('id');
  if (host === 'music.163.com' || host === 'y.music.163.com') {
    const match = path.match(/\/(song|playlist|album)(?:\b|\/)(\d+)?/);
    if (match && (id || match[2])) return {source: 'netease', type: match[1], id: id || match[2]};
  }
  if (host === 'y.qq.com' || host.endsWith('.y.qq.com')) {
    const match = path.match(/\/(songDetail|albumDetail|playlist)\/([\w-]+)/i);
    if (match) return {source: 'qq', type: {songdetail: 'song', albumdetail: 'album', playlist: 'playlist'}[match[1].toLowerCase()], id: match[2]};
    if (url.searchParams.get('songmid')) return {source:'qq', type:'song', id:url.searchParams.get('songmid')};
    if (url.searchParams.get('disstid')) return {source:'qq', type:'playlist', id:url.searchParams.get('disstid')};
  }
  return null;
}

export function audioExtension(blob, url = '', fallback = '') {
  const types = {'audio/mpeg':'mp3','audio/mp3':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/wave':'wav','audio/flac':'flac','audio/x-flac':'flac','audio/mp4':'m4a','video/mp4':'m4a','audio/aac':'aac','audio/ogg':'ogg','application/ogg':'ogg','audio/webm':'webm','video/webm':'webm','audio/opus':'opus'};
  const type = String(blob?.type || '').split(';')[0].toLowerCase();
  return types[type] || (url.match(/\.([a-z0-9]{2,5})(?:\?|$)/i)?.[1] || fallback || 'mp3').toLowerCase();
}

export function parseLrc(input) {
  const text = typeof input === 'string' ? input : input?.lyric || input?.lrc || '';
  const offset = Number(text.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const times = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const content = line.replace(/\[[^\]]+\]/g, '').replace(/<\d+:\d+(?:\.\d+)?>/g, '').trim();
    for (const time of times) rows.push({time: Number(time[1]) * 60 + Number(time[2]) + offset, text: content});
  }
  return rows.sort((a, b) => a.time - b.time);
}

export function transcodeArgs({input, output, format, bitrate = 192, track, lyrics = '', cover = '', copyAudio = false}) {
  const args = ['-i', input];
  if (cover) args.push('-i', cover);
  args.push('-map', '0:a:0');
  if (cover && ['mp3','flac','m4a'].includes(format)) args.push('-map', '1:v:0', '-c:v', 'mjpeg', '-disposition:v', 'attached_pic', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
  if (track) for (const field of ['title','artist','album']) if (track[field]) args.push('-metadata', `${field}=${track[field]}`);
  if (lyrics) args.push('-metadata', `lyrics=${lyrics}`);
  if (copyAudio) { args.push('-c:a','copy'); if(format==='mp3')args.push('-id3v2_version','3'); }
  else if (format === 'mp3') args.push('-c:a', 'libmp3lame', '-ar', '44100', '-b:a', `${Number(bitrate) || 192}k`, '-id3v2_version', '3');
  else if (format === 'flac') args.push('-c:a', 'flac');
  else if (format === 'wav') args.push('-c:a', 'pcm_s16le');
  else args.push('-c:a', 'copy');
  args.push('-y', output);
  return args;
}

export async function embedMp3Lyrics(blob, lyrics) {
  if(!lyrics)return blob;
  const old=new Uint8Array(await blob.slice(0,10).arrayBuffer());
  const tagged=old[0]===73&&old[1]===68&&old[2]===51;
  if(tagged && (old[3]!==3 || old[5]!==0))throw Error('不支持此 MP3 标签版本');
  const utf16=text=>{const bytes=new Uint8Array(2+text.length*2);bytes[0]=255;bytes[1]=254;const view=new DataView(bytes.buffer);for(let i=0;i<text.length;i++)view.setUint16(2+i*2,text.charCodeAt(i),true);return bytes;};
  const text=utf16(lyrics),payload=new Uint8Array(8+text.length);
  payload.set([1,122,104,111,255,254,0,0]);payload.set(text,8);
  const frame=new Uint8Array(10+payload.length);frame.set([85,83,76,84]);new DataView(frame.buffer).setUint32(4,payload.length);frame.set(payload,10);
  const oldSize=tagged ? ((old[6]&127)*2097152+(old[7]&127)*16384+(old[8]&127)*128+(old[9]&127)) : 0;
  const size=oldSize+frame.length;if(size>268435455)throw Error('MP3 标签过大');
  const header=new Uint8Array([73,68,51,3,0,0,(size>>>21)&127,(size>>>14)&127,(size>>>7)&127,size&127]);
  return new Blob([header,frame,blob.slice(tagged?10:0)],{type:'audio/mpeg'});
}
