import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('小时备份保留原 Git 树，追加评论且不改旧批次',async()=>{
 const source=await readFile(new URL('../snapshot.cjs',import.meta.url),'utf8'),calls=[],index={schema:1,lastSeq:0,files:[]};
 const oldCounts={schema:1,updatedAt:'2026-11-12T00:00:00Z',counts:{pinyin:5}};
 const respond=value=>new Response(JSON.stringify(value),{status:200});
 const fetch=async(url,options={})=>{
  calls.push({url:String(url),options});const path=new URL(url).pathname;
  if(path==='/snapshot')return respond({...oldCounts,updatedAt:'2026-11-12T01:00:00Z'});
  if(path==='/comments-export')return respond({schema:1,comments:[{seq:1,id:'id',name:'中文访客',body:'一条评论',created:1,hidden:0}],next:null});
  if(path.endsWith('/git/ref/heads/usage-data'))return respond({object:{sha:'oldcommit'}});
  if(path.endsWith('/contents/counts.json'))return respond({content:Buffer.from(JSON.stringify(oldCounts)).toString('base64')});
  if(path.endsWith('/contents/comments/index.json'))return respond({content:Buffer.from(JSON.stringify(index)).toString('base64')});
  if(path.endsWith('/git/commits/oldcommit'))return respond({tree:{sha:'oldtree'}});
  if(path.endsWith('/git/blobs'))return respond({sha:'blob'+calls.length});
  if(path.endsWith('/git/trees')){const body=JSON.parse(options.body);assert.equal(body.base_tree,'oldtree');assert.deepEqual(body.tree.map(x=>x.path),['comments/000000000001.json','comments/index.json']);return respond({sha:'newtree'});}
  if(path.endsWith('/git/commits'))return respond({sha:'newcommit'});
  if(path.endsWith('/git/refs/heads/usage-data')){assert.equal(JSON.parse(options.body).force,undefined);return respond({});}
  throw Error('unexpected '+url);
 };
 const state={exitCode:0};let ended;const done=new Promise(resolve=>ended=resolve);
 vm.runInNewContext(source,{fetch,URL,Response,Buffer,AbortSignal,process:{env:{USAGE_API_URL:'https://pocket-toolbox-usage.pages.dev',USAGE_SNAPSHOT_TOKEN:'test',GITHUB_REPOSITORY:'test/test',GITHUB_TOKEN:'test'},get exitCode(){return state.exitCode;},set exitCode(value){state.exitCode=value;ended();}},console:{log(){ended();},error(value){state.error=value;}},setTimeout});
 await done;assert.equal(state.exitCode,0,state.error);assert(calls.some(c=>c.url.includes('/git/refs/heads/usage-data')));
});
