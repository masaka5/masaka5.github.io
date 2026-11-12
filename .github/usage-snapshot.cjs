// Used by GitHub Actions. Never print credentials or raw environment.
const apiURL=process.env.USAGE_API_URL,token=process.env.USAGE_SNAPSHOT_TOKEN;
async function main(){
 if(!apiURL||!token)throw Error('统计端点或快照密钥未配置');
 const url=new URL(apiURL);if(url.protocol!=='https:'||!['pocket-toolbox-usage.pages.dev','pocket-toolbox-usage.wzw-manshii.workers.dev'].includes(url.hostname))throw Error('统计端点不在允许列表');
 const response=await fetch(new URL('/snapshot',url),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('快照接口返回 '+response.status);
 const raw=await response.text();if(raw.length>2000000)throw Error('快照过大');const data=JSON.parse(raw);
 if(data.schema!==1||!Number.isFinite(Date.parse(data.updatedAt))||!data.counts||Array.isArray(data.counts)||Object.keys(data.counts).length>20000)throw Error('快照格式无效');
 for(const[id,count]of Object.entries(data.counts))if(!/^[a-z0-9][a-z0-9-]{0,150}$/.test(id)||!Number.isSafeInteger(count)||count<0)throw Error('计数无效');
 const repo=process.env.GITHUB_REPOSITORY,headers={Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
 async function gh(path,method='GET',body){const r=await fetch('https://api.github.com/repos/'+repo+path,{method,headers,body:body?JSON.stringify(body):undefined});if(r.status===404)return null;if(!r.ok)throw Error('GitHub API '+r.status);return r.json();}
 const ref=await gh('/git/ref/heads/usage-data');let previous=null;if(ref){const old=await gh('/contents/counts.json?ref=usage-data');if(old){previous=JSON.parse(Buffer.from(old.content,'base64').toString());for(const[id,count]of Object.entries(previous.counts||{}))if((data.counts[id]??0)<count)throw Error('计数回退，保留已有快照');}}
 const oldIndex=ref?await gh('/contents/comments/index.json?ref=usage-data'):null;
 let index=oldIndex?JSON.parse(Buffer.from(oldIndex.content,'base64').toString()):{schema:1,lastSeq:0,files:[]};
 if(index.schema!==1||!Number.isSafeInteger(index.lastSeq)||index.lastSeq<0||!Array.isArray(index.files))throw Error('评论备份索引无效');
 const entries=[];let added=0;
 async function blobEntry(path,value){const blob=await gh('/git/blobs','POST',{content:JSON.stringify(value,null,2)+'\n',encoding:'utf-8'});entries.push({path,mode:'100644',type:'blob',sha:blob.sha});}
 for(let page=0;page<50;page++){
  const r=await fetch(new URL('/comments-export?after='+index.lastSeq,url),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('评论备份接口返回 '+r.status);
  const text=await r.text();if(text.length>2000000)throw Error('评论备份批次过大');const batch=JSON.parse(text);
  if(batch.schema!==1||!Array.isArray(batch.comments)||batch.comments.length>100)throw Error('评论备份格式无效');
  let seq=index.lastSeq;for(const comment of batch.comments){if(!Number.isSafeInteger(comment.seq)||comment.seq<=seq||typeof comment.name!=='string'||typeof comment.body!=='string'||comment.body.length>8000||typeof comment.id!=='string'||!Number.isSafeInteger(comment.created)||![0,1].includes(comment.hidden))throw Error('评论备份内容无效');seq=comment.seq;}
  if(!batch.comments.length)break;
  const path='comments/'+String(batch.comments[0].seq).padStart(12,'0')+'.json';await blobEntry(path,{schema:1,comments:batch.comments});index={schema:1,lastSeq:seq,files:[...index.files,path]};added+=batch.comments.length;
  if(batch.next===null)break;if(batch.next!==seq)throw Error('评论备份游标无效');
 }
 if(!previous||JSON.stringify(previous.counts)!==JSON.stringify(data.counts))await blobEntry('counts.json',data);
 if(added||!oldIndex)await blobEntry('comments/index.json',index);
 if(!entries.length){console.log('累计次数和评论未变化');return;}
 const parent=ref?await gh('/git/commits/'+ref.object.sha):null;
 const tree=await gh('/git/trees','POST',{...(parent?{base_tree:parent.tree.sha}:{}),tree:entries});
 const commit=await gh('/git/commits','POST',{message:'保存工具使用次数与访客留言',tree:tree.sha,parents:ref?[ref.object.sha]:[]});
 if(ref)await gh('/git/refs/heads/usage-data','PATCH',{sha:commit.sha});else await gh('/git/refs','POST',{ref:'refs/heads/usage-data',sha:commit.sha});
 console.log('已保存 '+Object.keys(data.counts).length+' 个工具的累计次数，新增评论 '+added+' 条');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
