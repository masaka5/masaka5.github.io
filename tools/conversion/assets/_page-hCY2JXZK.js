const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-xal15kUp.js","./UPNG-O-eDigm3.js","./_commonjsHelpers-BosuxZz1.js","./_commonjs-dynamic-modules-TDtrdbi3.js","./___vite-browser-external_commonjs-proxy-Dx7fIxtW.js","./__vite-browser-external-ke9ZaMpT.js"])))=>i.map(i=>d[i]);
import{Q as Fe,R as Ke,S as Ne,T as Oe,U as fe,V as Ve,a as x,aK as Ae,p as He,s as c,a6 as Ie,u as Me,i as S,t as T,c as Qe,g as e,e as o,b9 as Ue,o as r,r as z,v as t,x as h,f as s,dQ as je,w as Ge,dS as Je,hb as We,hc as Xe,hd as Ye,he as Ze,hf as es,hg as ss,hh as as,hi as ts,hj as os,hk as rs,hl as ls,hm as ns,hn as _s,ho as is,q as N,b as ue,d as J,eL as O,hp as ps,hq as ds,hr as cs,hs as vs,ht as us,hu as fs,fc as ms,hv as gs,gp as ws,hw as bs,hx as hs,hy as xs,hz as ys,hA as ks,hB as Ps,hC as $s}from"./toolbox-BYr8w-aO.js";import{P as qs}from"./PdfUploader-DdrCZqOL.js";import{f as Ss,d as Ts}from"./utils-C1hrSk9Z.js";import{T as zs,k as Ds,t as W,a as Ls}from"./tool-seo-BtvJHGoA.js";import{formatOutputName as Bs}from"./filename-DHpEjeWo.js";import"./rotate-cw-jo7gxuVk.js";function Cs(y,_){const k=Fe(_,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]];Ke(y,Ne({name:"shield-check"},()=>k,{get iconNode(){return i},children:(p,f)=>{var m=Oe(),P=fe(m);Ve(P,_,"default",{}),x(p,m)},$$slots:{default:!0}}))}async function Es(y,_){const{PDFDocument:k}=await Ae(async()=>{const{PDFDocument:f}=await import("./index-xal15kUp.js");return{PDFDocument:f}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),i=await y.arrayBuffer(),p=await k.load(i,{ignoreEncryption:!0});return await p.encrypt({userPassword:_.userPassword,ownerPassword:_.ownerPassword||_.userPassword,permissions:{printing:_.permissions?.printing??"highResolution",modifying:_.permissions?.modifying??!1,copying:_.permissions?.copying??!1,annotating:_.permissions?.annotating??!1}}),p.save()}var Rs=z('<div class="field svelte-1n96b6l"><label for="pw-owner" class="field-label svelte-1n96b6l"> </label> <input id="pw-owner" class="field-input svelte-1n96b6l" autocomplete="new-password"/> <p class="text-xs text-muted mt-1"> </p></div>'),Fs=z('<div class="opt-section svelte-1n96b6l"><div class="field svelte-1n96b6l"><label for="pw-user" class="field-label svelte-1n96b6l"> </label> <div class="pw-row svelte-1n96b6l"><input id="pw-user" class="field-input svelte-1n96b6l" autocomplete="new-password"/> <button class="show-btn svelte-1n96b6l" type="button"> </button></div></div> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <!></div> <div class="opt-section svelte-1n96b6l"><p class="field-label svelte-1n96b6l"> </p> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label> <label class="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox"/> </label></div> <div class="info-box svelte-1n96b6l"><!> <p class="text-sm"> </p></div> <button class="btn highlight"> </button>',1),Ks=z('<p class="text-sm text-failure"> </p>'),Ns=z('<div class="result-box svelte-1n96b6l"><p class="text-sm font-medium"> <b> </b></p> <button class="btn"> </button></div>'),Os=z('<div class="pw-page svelte-1n96b6l"><!> <!> <!> <!> <!> <!> <p class="text-xs text-muted mt-2"> </p></div>');function Us(y,_){He(_,!0);const k={"pdf_tools.tools.unlock_name":ws,"pdf_tools.tools.metadata_name":gs,"pdf_tools.tools.compress_name":ms};let i=c(Ie([])),p=c(""),f=c(""),m=c(!1),P=c(!0),V=c(!1),D=c(!1),L=c(!1),u=c(""),g=c(null),$=c(!1);Me(()=>{e(i),o(g,null),o(u,"")});async function me(){if(e(i).length===0){o(u,cs(),!0);return}if(!e(p).trim()){o(u,vs(),!0);return}if(e(p).trim().length<4){o(u,us(),!0);return}o(u,""),o(L,!0),o(g,null);try{o(g,await Es(e(i)[0],{userPassword:e(p).trim(),ownerPassword:e(m)&&e(f).trim()?e(f).trim():void 0,permissions:{printing:e(P)?"highResolution":!1,copying:e(V),modifying:e(D),annotating:e(D)}}),!0)}catch(a){o(u,a instanceof Error?a.message:fs(),!0)}o(L,!1)}function ge(){e(g)&&Ts(e(g),Bs(e(i)[0].name,"protected","pdf"))}var X=Os(),Y=t(X);{let a=h(Xe),n=h(We),d=h(Je);zs(Y,{category:"pdf",get title(){return e(a)},get description(){return e(n)},get icon(){return Ds},backHref:"/pdf-tools/",get backLabel(){return e(d)}})}var Z=s(Y,2);{let a=h(je);qs(Z,{multiple:!1,get label(){return e(a)},get files(){return e(i)},set files(n){o(i,n,!0)}})}var ee=s(Z,2);{var we=a=>{var n=Fs(),d=fe(n),v=t(d),B=t(v),A=t(B),C=s(B,2),w=t(C),E=s(w,2),H=t(E),R=s(v,2),oe=t(R),Pe=s(oe),$e=s(R,2);{var qe=l=>{var F=Rs(),K=t(F),M=t(K),b=s(K,2),Q=s(b,2),U=t(Q);T((q,j,G)=>{r(M,q),N(b,"type",e($)?"text":"password"),N(b,"placeholder",j),r(U,G)},[()=>ks(),()=>Ps(),()=>$s()]),ue(b,()=>e(f),q=>o(f,q)),x(l,F)};S($e,l=>{e(m)&&l(qe)})}var re=s(d,2),le=t(re),Se=t(le),ne=s(le,2),_e=t(ne),Te=s(_e),ie=s(ne,2),pe=t(ie),ze=s(pe),De=s(ie,2),de=t(De),Le=s(de),ce=s(re,2),ve=t(ce);Cs(ve,{size:16,class:"flex-shrink-0 mt-0.5"});var Be=s(ve,2),Ce=t(Be),I=s(ce,2),Ee=t(I);T((l,F,K,M,b,Q,U,q,j,G,Re)=>{r(A,l),N(w,"type",e($)?"text":"password"),N(w,"placeholder",F),r(H,K),r(Pe,` ${M??""}`),r(Se,b),r(Te,` ${Q??""}`),r(ze,` ${U??""}`),r(Le,` ${q??""}`),r(Ce,j),I.disabled=G,r(Ee,Re)},[()=>Ye(),()=>Ze(),()=>e($)?es():ss(),()=>as(),()=>ts(),()=>os(),()=>rs(),()=>ls(),()=>ns(),()=>e(L)||!e(p).trim(),()=>e(L)?_s():is()]),ue(w,()=>e(p),l=>o(p,l)),J("click",E,()=>o($,!e($))),O(oe,()=>e(m),l=>o(m,l)),O(_e,()=>e(P),l=>o(P,l)),O(pe,()=>e(V),l=>o(V,l)),O(de,()=>e(D),l=>o(D,l)),J("click",I,me),x(a,n)};S(ee,a=>{e(i).length>0&&a(we)})}var se=s(ee,2);{var be=a=>{var n=Ks(),d=t(n);T(()=>r(d,e(u))),x(a,n)};S(se,a=>{e(u)&&a(be)})}var ae=s(se,2);{var he=a=>{var n=Ns(),d=t(n),v=t(d),B=s(v),A=t(B),C=s(d,2),w=t(C);T((E,H,R)=>{r(v,`${E??""} `),r(A,H),r(w,R)},[()=>ps(),()=>Ss(e(g).byteLength),()=>ds()]),J("click",C,ge),x(a,n)};S(ae,a=>{e(g)&&a(he)})}var te=s(ae,2);{var xe=a=>{{let n=h(()=>W.password.faqKeys.length>=4?[{q:hs?.()??"",a:bs?.()??""},{q:ys?.()??"",a:xs?.()??""}]:[]),d=h(()=>W.password.related.map(v=>({href:v.href,name:k[v.nameKey]?.()??"",icon:v.icon})));Ls(a,{get faqs(){return e(n)},get relatedTools(){return e(d)}})}};S(te,a=>{W.password&&a(xe)})}var ye=s(te,2),ke=t(ye);T(a=>r(ke,a),[()=>Ue()]),x(y,X),Qe()}Ge(["click"]);export{Us as default};
