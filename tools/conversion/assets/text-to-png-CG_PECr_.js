import{Q as w,R as M,S as y,T,U as _,V as B,a as C}from"./toolbox-U5NevAex.js";function S(o,t){const s=w(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.554.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const c=[["path",{d:"M12 3v12"}],["path",{d:"m17 8-5-5-5 5"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}]];M(o,y({name:"upload"},()=>s,{get iconNode(){return c},children:(a,l)=>{var n=T(),r=_(n);B(r,t,"default",{}),C(a,n)},$$slots:{default:!0}}))}function U(o){const{text:t,fontSize:s,rotation:c,color:a,fontFamily:l,scale:n}=o,r=c*Math.PI/180,d=document.createElement("canvas"),x=d.getContext("2d"),h=s*n;x.font=`bold ${h}px ${l}`;const f=x.measureText(t).width,u=h*1.2,$=Math.abs(Math.cos(r)),g=Math.abs(Math.sin(r)),m=Math.ceil(f*$+u*g)+4,p=Math.ceil(f*g+u*$)+4,i=document.createElement("canvas");i.width=m,i.height=p;const e=i.getContext("2d");e.translate(m/2,p/2),e.rotate(r),e.font=`bold ${h}px ${l}`,e.fillStyle=a,e.textAlign="center",e.textBaseline="middle",e.fillText(t,0,0);const v=m/n,b=p/n;return d.width=0,d.height=0,{canvas:i,width:v,height:b}}async function z(o){const t=await new Promise((s,c)=>{o.toBlob(a=>{if(!a)return c(new Error("Failed to export canvas"));s(a)},"image/png")});return new Uint8Array(await t.arrayBuffer())}export{S as U,z as c,U as r};
