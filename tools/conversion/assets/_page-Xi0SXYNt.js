import{Q as X,R as Y,S as Z,T as ee,U as te,V as ae,a as b,p as se,s as k,a6 as le,i as I,t as K,b as P,g as n,d as oe,c as re,f as d,a7 as ne,a8 as ie,a9 as de,m as _e,o as f,e as q,r as A,v as i,w as ve,x as h,y as ce,aa as fe,ab as pe,ac as ue,n as he,ad as ge,ae as me,$ as xe,I as be,af as ye,ag as je,ah as $e,ai as we}from"./toolbox-U5NevAex.js";import{T as ke,t as T,a as qe}from"./tool-seo-OJI7xq1v.js";import"./rotate-cw-RQJHRg3t.js";function Te(y,g){const j=X(g,["children","$$slots","$$events","$$legacy"]);/**
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
 */const p=[["circle",{cx:"5",cy:"6",r:"3"}],["path",{d:"M12 6h5a2 2 0 0 1 2 2v7"}],["path",{d:"m15 9-3-3 3-3"}],["circle",{cx:"19",cy:"18",r:"3"}],["path",{d:"M12 18H7a2 2 0 0 1-2-2V9"}],["path",{d:"m9 15 3 3-3 3"}]];Y(y,Z({name:"git-compare-arrows"},()=>j,{get iconNode(){return p},children:(u,m)=>{var x=ee(),$=te(x);ae($,g,"default",{}),b(u,x)},$$slots:{default:!0}}))}var Ae=A('<div><span class="line-num svelte-1euvjt2"></span> <span class="line-prefix svelte-1euvjt2"> </span> <span class="line-text svelte-1euvjt2"> </span></div>'),He=A('<div class="diff-output svelte-1euvjt2"></div>'),Le=A('<div class="diff-page svelte-1euvjt2"><!> <div class="panels svelte-1euvjt2"><div class="panel svelte-1euvjt2"><label class="panel-label svelte-1euvjt2"> </label> <textarea class="code-area svelte-1euvjt2" spellcheck="false"></textarea></div> <div class="panel svelte-1euvjt2"><label class="panel-label svelte-1euvjt2"> </label> <textarea class="code-area svelte-1euvjt2" spellcheck="false"></textarea></div></div> <button class="btn highlight"> </button> <!> <p class="text-xs text-muted mt-2"> </p> <!></div>');function Ne(y,g){se(g,!0);const j={"dev_tools.tools.json_name":be,"dev_tools.tools.word_count_name":xe,"dev_tools.tools.markdown_name":me};let p=k(`Hello World
This is line 2
Line three here
Fourth line`),u=k(`Hello World
This line was changed
Line three here
Fourth line
New fifth line`),m=k(le([]));function x(){const e=n(p).split(`
`),t=n(u).split(`
`),l=[],a=$(e,t);let s=0,r=0,o=0;for(;s<e.length||r<t.length;)if(o<a.length&&s<e.length&&e[s]===a[o]){for(;r<t.length&&t[r]!==a[o];)l.push({type:"add",text:t[r]}),r++;l.push({type:"same",text:e[s]}),s++,r++,o++}else s<e.length&&(o>=a.length||e[s]!==a[o])?(l.push({type:"remove",text:e[s]}),s++):r<t.length&&(l.push({type:"add",text:t[r]}),r++);q(m,l,!0)}function $(e,t){const l=e.length,a=t.length,s=Array.from({length:l+1},()=>Array(a+1).fill(0));for(let v=1;v<=l;v++)for(let c=1;c<=a;c++)s[v][c]=e[v-1]===t[c-1]?s[v-1][c-1]+1:Math.max(s[v-1][c],s[v][c-1]);const r=[];let o=l,_=a;for(;o>0&&_>0;)e[o-1]===t[_-1]?(r.unshift(e[o-1]),o--,_--):s[o-1][_]>s[o][_-1]?o--:_--;return r}var H=Le(),L=i(H);{let e=h(pe),t=h(fe),l=h(ce);ke(L,{category:"dev",get title(){return n(e)},get description(){return n(t)},get icon(){return Te},backHref:"/dev-tools/",get backLabel(){return n(l)}})}var S=d(L,2),B=i(S),M=i(B),R=i(M),V=d(M,2),W=d(B,2),N=i(W),z=i(N),G=d(N,2),w=d(S,2),Q=i(w),C=d(w,2);{var U=e=>{var t=He();ue(t,21,()=>n(m),ge,(l,a,s)=>{var r=Ae(),o=i(r);o.textContent=s+1;var _=d(o,2),v=i(_),c=d(_,2),O=i(c);K(()=>{he(r,1,`diff-line ${n(a).type??""}`,"svelte-1euvjt2"),f(v,n(a).type==="add"?"+":n(a).type==="remove"?"-":" "),f(O,n(a).text||" ")}),b(l,r)}),b(e,t)};I(C,e=>{n(m).length>0&&e(U)})}var F=d(C,2),D=i(F),E=d(F,2);{var J=e=>{{let t=h(()=>T["dev-diff"].faqKeys.length>=4?[{q:je?.()??"",a:ye?.()??""},{q:we?.()??"",a:$e?.()??""}]:[]),l=h(()=>T["dev-diff"].related.map(a=>({href:a.href,name:j[a.nameKey]?.()??"",icon:a.icon})));qe(e,{get faqs(){return n(t)},get relatedTools(){return n(l)}})}};I(E,e=>{T["dev-diff"]&&e(J)})}K((e,t,l,a)=>{f(R,e),f(z,t),f(Q,l),f(D,a)},[()=>ne(),()=>ie(),()=>de(),()=>_e()]),P(V,()=>n(p),e=>q(p,e)),P(G,()=>n(u),e=>q(u,e)),oe("click",w,x),b(y,H),re()}ve(["click"]);export{Ne as default};
