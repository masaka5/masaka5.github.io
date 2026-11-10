(() => {
 const $=id=>document.getElementById(id);let controller=null,text='',run=0;
 function invalidate(){text='';$('locationFields').replaceChildren();$('copyLocation').disabled=true;$('locationSource').textContent='';Ops.status($('locationStatus'),'');Ops.status($('locationResultStatus'),'');}
 $('locationIP').oninput=$('locationProvider').onchange=invalidate;
 function urlFor(provider,ip){if(provider==='who')return 'https://ipwho.is/'+encodeURIComponent(ip);if(provider==='api')return 'https://ipapi.co/'+(ip?encodeURIComponent(ip)+'/':'')+'json/';return 'https://ipinfo.io/'+(ip?encodeURIComponent(ip)+'/':'')+'json';}
 function fieldsFor(provider,data){
  if(provider==='who')return [['IP 地址',data.ip],['协议',data.type],['国家／地区',data.country],['省／州',data.region],['城市',data.city],['运营商',data.connection?.isp],['组织',data.connection?.org],['ASN',data.connection?.asn],['时区',data.timezone?.id],['经纬度（近似）',data.latitude+', '+data.longitude]];
  if(provider==='api')return [['IP 地址',data.ip],['协议',data.version],['国家／地区',data.country_name],['省／州',data.region],['城市',data.city],['运营商／组织',data.org],['ASN',data.asn],['时区',data.timezone],['经纬度（近似）',data.latitude+', '+data.longitude]];
  const location=String(data.loc||'').split(',');return [['IP 地址',data.ip],['协议',String(data.ip||'').includes(':')?'IPv6':'IPv4'],['国家／地区',data.country],['省／州',data.region],['城市',data.city],['组织',data.org],['ASN',String(data.org||'').match(/^AS\d+/)?.[0]],['时区',data.timezone],['经纬度（近似）',location.length===2?location.join(', '):'']];
 }
 $('queryLocation').onclick=async()=>{
  let ip=$('locationIP').value.trim();try{if(ip){if(!ip.includes(':')&&!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip))throw Error('请输入有效的 IPv4 或 IPv6');const parsed=NetCore.parse(ip);if(parsed.bits===32&&!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip))throw Error('请输入有效的 IP 地址');ip=NetCore.format(parsed.value,parsed.bits);}}catch(error){invalidate();Ops.status($('locationStatus'),error.message,true);return;}
  invalidate();const provider=$('locationProvider').value,url=urlFor(provider,ip),controllerNow=new AbortController();controller=controllerNow;const signal=controllerNow.signal,token=++run,timer=setTimeout(()=>controllerNow.abort(),10000);
  for(const id of ['queryLocation','myLocation','locationIP','locationProvider'])$(id).disabled=true;$('stopLocation').disabled=false;Ops.status($('locationStatus'),'查询中…');
  try{
   const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});if(!response.ok)throw Error('服务返回 HTTP '+response.status+'，可切换数据来源。');const data=await response.json();if(data.success===false||data.error)throw Error('服务未返回可用信息，请检查 IP 或切换数据来源。');
   const normalized=fieldsFor(provider,data).map(([key,value])=>[key,value===undefined||value===null||value===''?'—':String(value)]);Ops.fields($('locationFields'),normalized);text=normalized.map(([key,value])=>key+'：'+value).join('\n');$('copyLocation').disabled=false;$('locationSource').textContent=({who:'IPWho.is',api:'IPapi.co',info:'IPinfo'})[provider];Ops.status($('locationStatus'),'查询完成');Ops.result();
  }catch(error){const message=signal.aborted?'已停止或请求超时':error instanceof TypeError?'连接失败或服务限制跨域，请切换数据来源。':error.message;Ops.status($('locationStatus'),message,true);Ops.status($('locationResultStatus'),message,true);}
  finally{clearTimeout(timer);if(token===run){controller=null;for(const id of ['queryLocation','myLocation','locationIP','locationProvider'])$(id).disabled=false;$('stopLocation').disabled=true;}}
 };
 $('myLocation').onclick=()=>{$('locationIP').value='';$('queryLocation').click();};$('stopLocation').onclick=()=>controller?.abort();$('copyLocation').onclick=()=>Ops.copy(text,$('locationResultStatus'));window.addEventListener('pagehide',()=>controller?.abort());
})();
