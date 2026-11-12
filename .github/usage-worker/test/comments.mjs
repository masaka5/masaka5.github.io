import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateComment,parseCommentPage} from '../src/comments.js';
test('访客评论验证中文文本、换行和长度，并拒绝伪造字段',()=>{
 const valid={id:'dd11cb93-f01b-4550-86b1-8c15f2df333b',name:'  访客  ',body:'  这个工具很好用\r\n谢谢！  ',website:''};
 assert.deepEqual(validateComment(valid),{id:valid.id,name:'访客',body:'这个工具很好用\n谢谢！'});
 for(const patch of [{id:'x'},{name:'x'.repeat(33)},{name:'a\nb'},{body:'x'},{body:'字'.repeat(2001)},{body:'hi\u0000x'},{website:'spam'},{body:123}])assert.equal(validateComment({...valid,...patch}),null);
 assert.equal(validateComment(null),null);
});
test('分页参数限界，游标只接收安全正整数',()=>{
 assert.deepEqual(parseCommentPage(new URL('https://test/comments')),{before:Number.MAX_SAFE_INTEGER,limit:20});
 assert.equal(parseCommentPage(new URL('https://test/comments?before=-1')),null);
 assert.equal(parseCommentPage(new URL('https://test/comments?before=1.1')),null);
 assert.equal(parseCommentPage(new URL('https://test/comments?limit=100')),null);
 assert.deepEqual(parseCommentPage(new URL('https://test/comments?before=42&limit=10')),{before:42,limit:10});
});
