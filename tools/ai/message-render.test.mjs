import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMessageBlocks} from './message-render.mjs';

test('parses a fenced block with language',()=>{
  assert.deepEqual(parseMessageBlocks('说明\n```js\nconst answer = 42;\n```\n结束'),[
    {type:'text',text:'说明\n',language:''},
    {type:'code',text:'const answer = 42;',language:'js'},
    {type:'text',text:'结束',language:''},
  ]);
});

test('parses an unlabeled block and multiple blocks',()=>{
  assert.deepEqual(parseMessageBlocks('```\none\n```\n中间\n```python\ntwo\n```'),[
    {type:'code',text:'one',language:''},
    {type:'text',text:'中间\n',language:''},
    {type:'code',text:'two',language:'python'},
  ]);
});

test('keeps an unclosed fence as ordinary text',()=>{
  const input='开始\n```js\nconst x = `value`;';
  assert.deepEqual(parseMessageBlocks(input),[{type:'text',text:input,language:''}]);
});

test('keeps backticks inside a code block',()=>{
  assert.deepEqual(parseMessageBlocks('```sh\necho `date`\n```'),[
    {type:'code',text:'echo `date`',language:'sh'},
  ]);
});
