import React,{useEffect,useMemo,useState}from'react';
import DOMPurify from'dompurify';
import {Button,Input,Tooltip,Tag}from'antd';
import {SoundOutlined,SwapOutlined}from'@ant-design/icons';
import {cardSides,textOnly}from'../cards.mjs';
const mime=name=>/\.mp3$/i.test(name)?'audio/mpeg':/\.wav$/i.test(name)?'audio/wav':/\.ogg$/i.test(name)?'audio/ogg':/\.webm$/i.test(name)?'video/webm':/\.mp4$/i.test(name)?'video/mp4':/\.png$/i.test(name)?'image/png':/\.svg$/i.test(name)?'image/svg+xml':/\.webp$/i.test(name)?'image/webp':'image/jpeg';
export function speak(card){
 if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(card.language?.startsWith('ja')?card.reading||textOnly(card.front):textOnly(card.front));speech.lang=card.language||'en-US';speech.rate=.85;window.speechSynthesis.speak(speech);
}
function SafeTemplate({card,answer,api,fontSize}){
 const [document,setDocument]=useState(''),sides=useMemo(()=>cardSides(card),[card]);
 useEffect(()=>{
  let cancelled=false;const urls=[];
  (async()=>{
   let html=DOMPurify.sanitize(answer?sides.back:sides.front,{FORBID_TAGS:['script','iframe','object','embed','form','input','button','link','meta'],FORBID_ATTR:['srcset','formaction']});
   const parsed=new DOMParser().parseFromString(html,'text/html');const audioNames=[];
   for(const match of html.matchAll(/\[sound:([^\]]+)\]/g))audioNames.push(match[1]);
   const names=new Set([...audioNames,...[...parsed.querySelectorAll('img,audio,video,source')].map(e=>e.getAttribute('src')).filter(Boolean)]);
   const mapping=new Map();await Promise.all([...names].map(async name=>{
    if(/^(?:data:|blob:)/i.test(name)){mapping.set(name,name);return;}
    if(/^[a-z][a-z0-9+.-]*:|^\/\//i.test(name))return;
    let decoded=name;try{decoded=decodeURIComponent(name);}catch{}const bytes=await api.call('media',{name:decoded})||(decoded!==name?await api.call('media',{name}):null);if(bytes){const url=URL.createObjectURL(new Blob([bytes],{type:mime(decoded)}));urls.push(url);mapping.set(name,url);}
   }));
   for(const element of parsed.querySelectorAll('img,audio,video,source')){const src=element.getAttribute('src');if(mapping.has(src))element.setAttribute('src',mapping.get(src));else element.removeAttribute('src');if(element.tagName==='AUDIO'||element.tagName==='VIDEO')element.setAttribute('controls','');}
   html=parsed.body.innerHTML.replace(/\[sound:([^\]]+)\]/g,(_,name)=>mapping.has(name)?`<audio controls preload="metadata" src="${mapping.get(name)}"></audio>`:'');
   // Block remote requests from imported HTML/CSS; card scripts stay disabled.
   const css=String(sides.css||'').replace(/<\/?style[^>]*>/gi,'').replace(/@import[^;]*;/gi,'').replace(/url\([^)]*\)/gi,'none');
   const source=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; media-src blob: data:; style-src 'unsafe-inline'; font-src 'none'; base-uri 'none'; form-action 'none'"><style>html,body{margin:0;background:transparent;color:#242d3a;font-family:system-ui,'Microsoft YaHei',sans-serif}body{padding:20px;box-sizing:border-box;overflow-wrap:anywhere;line-height:1.65;text-align:center;font-size:${fontSize}px}img,video{max-width:100%;max-height:230px;object-fit:contain}audio{max-width:100%;height:40px}.cloze{color:#315fc9;font-weight:600}hr{border:0;border-top:1px solid #e6e9ef;margin:20px 0}${css}</style></head><body class="card">${html}</body></html>`;
   if(!cancelled)setDocument(source);
  })().catch(()=>{if(!cancelled)setDocument('<p>卡片媒体载入失败，请检查牌组文件。</p>');});
  return()=>{cancelled=true;urls.forEach(url=>URL.revokeObjectURL(url));};
 },[sides,answer,api,fontSize]);
 return<iframe className="template-frame" title={answer?'卡片答案':'卡片题目'} sandbox="" srcDoc={document}/>;
}
export function CardView({card,flipped,setFlipped,settings,api,typed,setTyped}){
 const templated=!!card.model||card.type==='cloze',typing=settings.typing||card.type==='typing';
 return<>
  <div className="flashcard-tools"><Tag bordered={false}>{card.state===0?'新卡':card.state===2?'复习':'学习中'}</Tag><Tooltip title="朗读"><Button type="text" shape="circle" icon={<SoundOutlined/>} aria-label="朗读" onClick={()=>speak(card)}/></Tooltip></div>
  <div className={'flashcard-content'+(templated?' is-template':'')}>
   {templated?<SafeTemplate card={card} answer={flipped} api={api} fontSize={settings.fontSize||32}/>:<>
    <div className="word-face" lang={card.language} style={{fontSize:settings.fontSize||32}}>{card.front}</div>
    {card.reading&&(flipped||!card.language?.startsWith('ja'))?<div className="word-reading">{card.reading}</div>:null}
    {flipped?<div className="word-answer"><div>{card.back}</div>{card.extra?<p className="word-extra">{card.extra}</p>:null}</div>:null}
   </>}
  </div>
  {typing?<div className="typing-area"><Input placeholder="输入答案后翻面" value={typed} onChange={e=>setTyped(e.target.value)} onPressEnter={()=>setFlipped(true)} aria-label="输入答案" readOnly={flipped}/>{flipped&&typed?<span className="typing-result">{typed.normalize('NFKC').trim().toLowerCase()===textOnly(card.back).normalize('NFKC').trim().toLowerCase()?'回答一致':'可对照释义自行评分'}</span>:null}</div>:null}
  <div className="flashcard-tags">{card.tags.slice(0,6).map(tag=><Tag key={tag} bordered={false}>{({zk:'中考',gk:'高考',cet4:'四级',cet6:'六级',ky:'考研',toefl:'托福',ielts:'雅思',gre:'GRE',n:'名词',adj:'形容词',adv:'副词',exp:'短语',pn:'代词','v1':'一段动词','v5r':'五段动词',prt:'助词',int:'感叹词'})[tag]||tag}</Tag>)}</div>
 </>;
}
