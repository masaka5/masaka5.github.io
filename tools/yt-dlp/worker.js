let python,initializing;
import * as browserNetwork from './browser-network.mjs';
const base=new URL('../../../vendor/pyodide/',import.meta.url).href;
const emit=(type,data)=>postMessage({type,...data});
async function initialize(){
 if(python)return python;
 if(initializing)return initializing;
 initializing=loadEngine();
 try{return await initializing;}finally{initializing=null;}
}
async function loadEngine(){
 emit('status',{text:'正在载入下载引擎…'});
 const response=await fetch(new URL('./runtime/yt_dlp-2026.10.26.whl',import.meta.url));
 if(!response.ok)throw Error('下载引擎文件加载失败');
 const wheel=new Uint8Array(await response.arrayBuffer());
 const adapter=await fetch(new URL('./network.py',import.meta.url));if(!adapter.ok)throw Error('网络适配器加载失败');
 const adapterSource=await adapter.text();
 const {loadPyodide}=await import(base+'pyodide.mjs');
 const loaded=await loadPyodide({indexURL:base,stdout:text=>emit('log',{text}),stderr:text=>emit('log',{text})});
 loaded.FS.writeFile('/tmp/yt_dlp.zip',wheel);
 loaded.runPython("import sys\nsys.path.insert(0, '/tmp/yt_dlp.zip')");
 loaded.registerJsModule('browser_network',browserNetwork);
 loaded.runPython(adapterSource);
 python=loaded;
 return python;
}
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(()=>handle(data));};
async function handle(data){
 try{
  const py=await initialize();
  if(data.type==='catalog'){
   const text=py.runPython(`import json\nfrom yt_dlp.extractor import gen_extractor_classes\nfrom yt_dlp.options import parseOpts\n_parser, _options, _urls = parseOpts([])\njson.dumps({'extractors': [{'name':cls.IE_NAME,'description':str(getattr(cls,'IE_DESC','') or '')} for cls in gen_extractor_classes()], 'options':[{'names':o._short_opts+o._long_opts,'help':o.help or ''}for group in [_parser]+_parser.option_groups for o in group.option_list if o._long_opts and o.help != 'SUPPRESSHELP']})`);
   emit('catalog',{data:JSON.parse(text)});return;
  }
  py.globals.set('__input',JSON.stringify(data));
  emit('status',{text:'正在解析…'});
  const text=await py.runPythonAsync(`
import json, yt_dlp
import shlex
_data=json.loads(__input)
_opts=dict(_data.get('options') or {})
if _data.get('cli'):
    from yt_dlp import parse_options
    _parsed=parse_options(shlex.split(_data['cli']))
    if _parsed.urls: raise ValueError('链接请填写在媒体链接输入框中')
    _defaults=parse_options([]).ydl_opts
    _opts.update({key:value for key,value in _parsed.ydl_opts.items() if value != _defaults.get(key)})
for _name in ('proxy','geo_verification_proxy','cookiesfrombrowser','exec_cmd','external_downloader','postprocessors','paths','js_runtimes','remote_components'):
    if _opts.get(_name): raise ValueError('浏览器模式无法直接执行参数：'+_name)
if _data.get('cookies'):
    with open('/tmp/browser-cookies.txt','w') as _f: _f.write(_data['cookies'])
    _opts['cookiefile']='/tmp/browser-cookies.txt'
_opts.update({'quiet':True,'no_warnings':False,'skip_download':True,'noplaylist':not _data.get('playlist',False),'socket_timeout':_data.get('timeout',30),'js_runtimes':{}})
_results=[]
with yt_dlp.YoutubeDL(_opts) as _ydl:
    _ydl._request_director.close()
    _ydl._request_director.add_handler(BrowserRH(logger=_ydl._request_director.logger))
    for _url in _data['urls']:
        _info = _ydl.extract_info(_url,download=False)
        def _names(item):
            if item is None: return
            if 'entries' in item:
                item['entries'] = list(item['entries'])
                for entry in item['entries']: _names(entry)
            else: item['_browser_filename'] = _ydl.prepare_filename(item)
        _names(_info)
        _results.append(_ydl.sanitize_info(_info))
json.dumps(_results,ensure_ascii=False)
`);
  emit('result',{data:JSON.parse(text)});
 }catch(error){const text=String(error);emit('error',{text:text.split('\n').filter(Boolean).at(-1)||text});}
};
