const PALETTE=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
const HIGH='ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
const LOW=' ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼';
export function cp437(byte){return byte<32?LOW[byte]:byte===127?'⌂':byte<127?String.fromCharCode(byte):HIGH[byte-128];}
const CODE={Escape:'esc',Backspace:'backspace',Tab:'tab',Enter:'ret',Space:'spc',Minus:'minus',Equal:'equal',BracketLeft:'bracket_left',BracketRight:'bracket_right',Backslash:'backslash',Semicolon:'semicolon',Quote:'apostrophe',Backquote:'grave_accent',Comma:'comma',Period:'dot',Slash:'slash',CapsLock:'caps_lock',NumLock:'num_lock',ScrollLock:'scroll_lock',Insert:'insert',Delete:'delete',Home:'home',End:'end',PageUp:'pgup',PageDown:'pgdn',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',NumpadEnter:'kp_enter',NumpadAdd:'kp_add',NumpadSubtract:'kp_subtract',NumpadMultiply:'asterisk',NumpadDivide:'kp_divide',NumpadDecimal:'kp_decimal',PrintScreen:'print',Pause:'pause'};
for(let n=0;n<26;n++)CODE['Key'+String.fromCharCode(65+n)]=String.fromCharCode(97+n);
for(let n=0;n<10;n++){CODE['Digit'+n]=String(n);CODE['Numpad'+n]='kp_'+n;}
for(let n=1;n<=12;n++)CODE['F'+n]='f'+n;
const MODIFIERS={ShiftLeft:'shift',ShiftRight:'shift_r',ControlLeft:'ctrl',ControlRight:'ctrl_r',AltLeft:'alt',AltRight:'alt_r',MetaLeft:'meta_l',MetaRight:'meta_r'};
const SET1={1:'esc',2:'1',3:'2',4:'3',5:'4',6:'5',7:'6',8:'7',9:'8',10:'9',11:'0',12:'minus',13:'equal',14:'backspace',15:'tab',16:'q',17:'w',18:'e',19:'r',20:'t',21:'y',22:'u',23:'i',24:'o',25:'p',26:'bracket_left',27:'bracket_right',28:'ret',29:'ctrl',30:'a',31:'s',32:'d',33:'f',34:'g',35:'h',36:'j',37:'k',38:'l',39:'semicolon',40:'apostrophe',41:'grave_accent',42:'shift',43:'backslash',44:'z',45:'x',46:'c',47:'v',48:'b',49:'n',50:'m',51:'comma',52:'dot',53:'slash',54:'shift_r',56:'alt',57:'spc',58:'caps_lock'};
const EXT={28:'kp_enter',29:'ctrl_r',53:'kp_divide',56:'alt_r',71:'home',72:'up',73:'pgup',75:'left',77:'right',79:'end',80:'down',81:'pgdn',82:'insert',83:'delete',91:'meta_l',92:'meta_r'};
for(let n=1;n<=10;n++)SET1[58+n]='f'+n;
Object.assign(SET1,{69:'num_lock',70:'scroll_lock',71:'kp_7',72:'kp_8',73:'kp_9',74:'kp_subtract',75:'kp_4',76:'kp_5',77:'kp_6',78:'kp_add',79:'kp_1',80:'kp_2',81:'kp_3',82:'kp_0',83:'kp_decimal',87:'f11',88:'f12'});
const ASCII={};
for(let n=0;n<26;n++){const c=String.fromCharCode(97+n);ASCII[c]=c;ASCII[c.toUpperCase()]='shift-'+c;}
for(const [plain,shifted,key] of [['1','!','1'],['2','@','2'],['3','#','3'],['4','$','4'],['5','%','5'],['6','^','6'],['7','&','7'],['8','*','8'],['9','(','9'],['0',')','0'],['-','_','minus'],['=','+','equal'],['[','{','bracket_left'],[']','}','bracket_right'],['\\','|','backslash'],[';',':','semicolon'],["'",'"','apostrophe'],['`','~','grave_accent'],[',','<','comma'],['.','>','dot'],['/','?','slash']]){ASCII[plain]=key;ASCII[shifted]='shift-'+key;}
Object.assign(ASCII,{' ':'spc','\n':'ret','\r':'ret','\t':'tab','\b':'backspace'});

// Reads Linux vcsa, whose header and cells describe the logical visible page,
// including hardware scroll offsets. No physical VGA page-zero assumptions.
export class QemuTextScreen {
 constructor({canvas,viewport,sendKeys,sendMouse,readScreen,onSize=()=>{},onError=()=>{}}){
  Object.assign(this,{canvas,viewport,sendKeys,sendMouse,readScreen,onSize,onError});
  this.enabled=false;this.keyboardEnabled=false;this.mouseEnabled=false;this.inflight=false;this.disposed=false;this.keyQueue=Promise.resolve();
  this.keyHandler=e=>this.keydown(e);this.mouseHandler=e=>this.mouse(e);
  viewport.addEventListener('keydown',this.keyHandler);viewport.addEventListener('mousemove',this.mouseHandler);viewport.addEventListener('mousedown',this.mouseHandler);viewport.addEventListener('mouseup',this.mouseHandler);
 }
 setEnabled(value){this.enabled=!!value;clearTimeout(this.timer);if(this.enabled&&!this.inflight)this.poll();}
 setKeyboardEnabled(value){this.keyboardEnabled=!!value;}
 setMouseEnabled(value){this.mouseEnabled=!!value;}
 async poll(){if(!this.enabled||this.disposed||this.inflight)return;this.inflight=true;try{const bytes=await this.readScreen();if(this.enabled&&bytes?.length)this.draw(bytes);}catch(error){this.onError(error);}finally{this.inflight=false;if(this.enabled&&!this.disposed)this.timer=setTimeout(()=>this.poll(),250);}}
 draw(data){
  const bytes=data instanceof Uint8Array?data:new Uint8Array(data),rows=bytes[0],cols=bytes[1],cursorX=bytes[2],cursorY=bytes[3];
  if(!rows||!cols||rows>100||cols>240||bytes.length!==4+rows*cols*2)throw Error('图形控制台数据尚未就绪');
  if(this.cols!==cols||this.rows!==rows){this.cols=cols;this.rows=rows;this.canvas.width=cols*9;this.canvas.height=rows*18;this.onSize(cols*9,rows*18);}
  const ctx=this.canvas.getContext('2d');ctx.font='16px "Cascadia Mono", Consolas, monospace';ctx.textBaseline='top';
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const i=4+(y*cols+x)*2,attr=bytes[i+1];ctx.fillStyle=PALETTE[(attr>>4)&7];ctx.fillRect(x*9,y*18,9,18);ctx.fillStyle=PALETTE[attr&15];ctx.fillText(cp437(bytes[i]),x*9,y*18,9);
  }
  if(cursorX<cols&&cursorY<rows){ctx.fillStyle=PALETTE[bytes[5+(cursorY*cols+cursorX)*2]&15];ctx.fillRect(cursorX*9,cursorY*18+16,9,2);}
  this.lastFrame=bytes.slice();
 }
 enqueue(keys){const task=this.keyQueue.then(()=>this.sendKeys(keys));this.keyQueue=task.catch(error=>this.onError(error));return task;}
 keydown(event){
  if(!this.enabled||!this.keyboardEnabled||!(this.viewport===document.activeElement||this.viewport.contains(document.activeElement))||event.isComposing)return;
  if(MODIFIERS[event.code]){event.preventDefault();return;}
  const printable=event.key?.length===1?ASCII[event.key]:null,key=printable||CODE[event.code];if(!key)return;
  event.preventDefault();const mods=[];if(event.ctrlKey)mods.push('ctrl');if(event.altKey)mods.push('alt');if(event.shiftKey&&!printable)mods.push('shift');if(event.metaKey)mods.push('meta_l');this.enqueue([...mods,key].join('-'));
 }
 sendScancodes(values){
  const modifiers=new Set(),chords=[];let extended=false;
  for(const value of values){if(value===0xe0){extended=true;continue;}if(value===0xe1)throw Error('不支持此扫描码序列');const release=!!(value&128),key=(extended?EXT:SET1)[value&127];extended=false;if(!key)throw Error('不支持此扫描码');if(['ctrl','ctrl_r','alt','alt_r','shift','shift_r','meta_l','meta_r'].includes(key)){if(release)modifiers.delete(key);else modifiers.add(key);}else if(!release)chords.push([...modifiers,key].join('-'));}
  return chords.reduce((p,key)=>p.then(()=>this.enqueue(key)),Promise.resolve());
 }
 sendText(text){const keys=Array.from(text,c=>{if(!ASCII[c])throw Error('图形控制台仅支持英文键盘输入，请使用串口终端输入中文');return ASCII[c];});return keys.reduce((p,key)=>p.then(()=>this.enqueue(key)),Promise.resolve());}
 mouse(event){if(!this.enabled||!this.mouseEnabled||!this.sendMouse||document.activeElement!==this.viewport)return;event.preventDefault();const buttons=(event.buttons&1?1:0)|(event.buttons&2?2:0)|(event.buttons&4?4:0);Promise.resolve(this.sendMouse({dx:event.movementX,dy:event.movementY,buttons})).catch(error=>this.onError(error));}
 screenshot(){const image=new Image();image.src=this.canvas.toDataURL('image/png');return image;}
 dispose(){this.disposed=true;this.enabled=false;clearTimeout(this.timer);this.viewport.removeEventListener('keydown',this.keyHandler);for(const type of ['mousemove','mousedown','mouseup'])this.viewport.removeEventListener(type,this.mouseHandler);}
}
