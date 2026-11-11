const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-xal15kUp.js","./UPNG-O-eDigm3.js","./_commonjsHelpers-BosuxZz1.js","./_commonjs-dynamic-modules-TDtrdbi3.js","./___vite-browser-external_commonjs-proxy-Dx7fIxtW.js","./__vite-browser-external-ke9ZaMpT.js"])))=>i.map(i=>d[i]);
import{Q as Ce,R as Fe,S as Ie,T as Ne,U as fe,V as Ve,a as x,aI as Ae,p as He,s as c,a6 as Ke,u as Me,i as T,t as z,c as Qe,g as e,e as o,b7 as Ue,o as r,r as D,v as t,x as h,f as s,dO as je,w as Je,dQ as Ge,h9 as We,ha as Xe,hb as Ye,hc as Ze,hd as es,he as ss,hf as as,hg as ts,hh as os,hi as rs,hj as ls,hk as ns,hl as _s,hm as is,q as I,b as ue,d as G,eJ as N,hn as ps,ho as ds,hp as cs,hq as vs,hr as us,hs as fs,fa as ms,ht as gs,gn as ws,hu as bs,hv as hs,hw as xs,hx as ys,hy as ks,hz as Ps,hA as $s}from"./toolbox-U5NevAex.js";import{P as qs}from"./PdfUploader-CuH6VN-I.js";import{f as Ts,d as zs}from"./utils-Ch0x7dtD.js";import{T as Ds,k as Ss,t as W,a as Es}from"./tool-seo-OJI7xq1v.js";import{formatOutputName as Ls}from"./filename-DHpEjeWo.js";import"./rotate-cw-RQJHRg3t.js";function Os(y,_){const k=Ce(_,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]];Fe(y,Ie({name:"shield-check"},()=>k,{get iconNode(){return i},children:(p,f)=>{var m=Ne(),P=fe(m);Ve(P,_,"default",{}),x(p,m)},$$slots:{default:!0}}))}async function Rs(y,_){const{PDFDocument:k}=await Ae(async()=>{const{PDFDocument:f}=await import("./index-xal15kUp.js");return{PDFDocument:f}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),i=await y.arrayBuffer(),p=await k.load(i,{ignoreEncryption:!0});return await p.encrypt({userPassword:_.userPassword,ownerPassword:_.ownerPassword||_.userPassword,permissions:{printing:_.permissions?.printing??"highResolution",modifying:_.permissions?.modifying??!1,copying:_.permissions?.copying??!1,annotating:_.permissions?.annotating??!1}}),p.save()}var Bs=D('<div class="field svelte-1n96b6l"><label for="pw-owner" class="field-label svelte-1n96b6l"> </label> <input id="pw-owner" class="field-input svelte-1n96b6l" autocomplete="new-password"/> <p class="text-xs text-muted mt-1"> </p></div>'),Cs=D('<div class="opt-section svelte-1n96b6l"><div class="field svelte-1n96b6l"><label for="pw-user" class="field-label svelte-1n96b6l"> </label> <div class="pw-row svelte-1n96b6l"><input id="pw-user" class="field-input svelte-1n96b6l" autocomplete="new-password"/> <button class="show-btn svelte-1n96b6l" type="button"> </button></div></div> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <!></div> <div class="opt-section svelte-1n96b6l"><p class="field-label svelte-1n96b6l"> </p> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label></div> <div class="info-box svelte-1n96b6l"><!> <p class="text-sm"> </p></div> <button class="btn highlight"> </button>',1),Fs=D('<p class="text-sm text-failure"> </p>'),Is=D('<div class="result-box svelte-1n96b6l"><p class="text-sm font-medium"> <b> </b></p> <button class="btn"> </button></div>'),Ns=D('<div class="pw-page svelte-1n96b6l"><!> <!> <!> <!> <!> <!> <p class="text-xs text-muted mt-2"> </p></div>');function Us(y,_){He(_,!0);const k={"pdf_tools.tools.unlock_name":ws,"pdf_tools.tools.metadata_name":gs,"pdf_tools.tools.compress_name":ms};let i=c(Ke([])),p=c(""),f=c(""),m=c(!1),P=c(!0),V=c(!1),S=c(!1),E=c(!1),u=c(""),g=c(null),$=c(!1);Me(()=>{e(i),o(g,null),o(u,"")});async function me(){if(e(i).length===0){o(u,cs(),!0);return}if(!e(p).trim()){o(u,vs(),!0);return}if(e(p).trim().length<4){o(u,us(),!0);return}o(u,""),o(E,!0),o(g,null);try{o(g,await Rs(e(i)[0],{userPassword:e(p).trim(),ownerPassword:e(m)&&e(f).trim()?e(f).trim():void 0,permissions:{printing:e(P)?"highResolution":!1,copying:e(V),modifying:e(S),annotating:e(S)}}),!0)}catch(a){o(u,a instanceof Error?a.message:fs(),!0)}o(E,!1)}function ge(){e(g)&&zs(e(g),Ls(e(i)[0].name,"protected","pdf"))}var X=Ns(),Y=t(X);{let a=h(Xe),n=h(We),d=h(Ge);Ds(Y,{category:"pdf",get title(){return e(a)},get description(){return e(n)},get icon(){return Ss},backHref:"/pdf-tools/",get backLabel(){return e(d)}})}var Z=s(Y,2);{let a=h(je);qs(Z,{multiple:!1,get label(){return e(a)},get files(){return e(i)},set files(n){o(i,n,!0)}})}var ee=s(Z,2);{var we=a=>{var n=Cs(),d=fe(n),v=t(d),L=t(v),A=t(L),O=s(L,2),w=t(O),R=s(w,2),H=t(R),B=s(v,2),oe=t(B),Pe=s(oe),$e=s(B,2);{var qe=l=>{var C=Bs(),F=t(C),M=t(F),b=s(F,2),Q=s(b,2),U=t(Q);z((q,j,J)=>{r(M,q),I(b,"type",e($)?"text":"password"),I(b,"placeholder",j),r(U,J)},[()=>ks(),()=>Ps(),()=>$s()]),ue(b,()=>e(f),q=>o(f,q)),x(l,C)};T($e,l=>{e(m)&&l(qe)})}var re=s(d,2),le=t(re),Te=t(le),ne=s(le,2),_e=t(ne),ze=s(_e),ie=s(ne,2),pe=t(ie),De=s(pe),Se=s(ie,2),de=t(Se),Ee=s(de),ce=s(re,2),ve=t(ce);Os(ve,{size:16,class:"flex-shrink-0 mt-0.5"});var Le=s(ve,2),Oe=t(Le),K=s(ce,2),Re=t(K);z((l,C,F,M,b,Q,U,q,j,J,Be)=>{r(A,l),I(w,"type",e($)?"text":"password"),I(w,"placeholder",C),r(H,F),r(Pe,` ${M??""}`),r(Te,b),r(ze,` ${Q??""}`),r(De,` ${U??""}`),r(Ee,` ${q??""}`),r(Oe,j),K.disabled=J,r(Re,Be)},[()=>Ye(),()=>Ze(),()=>e($)?es():ss(),()=>as(),()=>ts(),()=>os(),()=>rs(),()=>ls(),()=>ns(),()=>e(E)||!e(p).trim(),()=>e(E)?_s():is()]),ue(w,()=>e(p),l=>o(p,l)),G("click",R,()=>o($,!e($))),N(oe,()=>e(m),l=>o(m,l)),N(_e,()=>e(P),l=>o(P,l)),N(pe,()=>e(V),l=>o(V,l)),N(de,()=>e(S),l=>o(S,l)),G("click",K,me),x(a,n)};T(ee,a=>{e(i).length>0&&a(we)})}var se=s(ee,2);{var be=a=>{var n=Fs(),d=t(n);z(()=>r(d,e(u))),x(a,n)};T(se,a=>{e(u)&&a(be)})}var ae=s(se,2);{var he=a=>{var n=Is(),d=t(n),v=t(d),L=s(v),A=t(L),O=s(d,2),w=t(O);z((R,H,B)=>{r(v,`${R??""} `),r(A,H),r(w,B)},[()=>ps(),()=>Ts(e(g).byteLength),()=>ds()]),G("click",O,ge),x(a,n)};T(ae,a=>{e(g)&&a(he)})}var te=s(ae,2);{var xe=a=>{{let n=h(()=>W.password.faqKeys.length>=4?[{q:hs?.()??"",a:bs?.()??""},{q:ys?.()??"",a:xs?.()??""}]:[]),d=h(()=>W.password.related.map(v=>({href:v.href,name:k[v.nameKey]?.()??"",icon:v.icon})));Es(a,{get faqs(){return e(n)},get relatedTools(){return e(d)}})}};T(te,a=>{W.password&&a(xe)})}var ye=s(te,2),ke=t(ye);z(a=>r(ke,a),[()=>Ue()]),x(y,X),Qe()}Je(["click"]);export{Us as default};
