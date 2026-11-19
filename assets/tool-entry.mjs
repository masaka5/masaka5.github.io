import { recordToolUse } from './tool-use.mjs?v=20261120-stat1';
const tool=document.querySelector('meta[name="toolbox-tool-id"]')?.content?.trim();
if(tool)recordToolUse(tool);
