import{Q as $a,R as ka,S as Ma,T as Ta,U as Ca,V as Qa,a as w,p as Ra,u as Ba,cu as La,cP as Pa,cQ as za,cR as Aa,cS as Ha,B as Ia,q as h,ac as Sa,i as z,t as k,b as M,g as a,d as A,c as Ea,s as c,e as _,aI as Fa,bm as aa,f as s,cT as Na,cU as Va,cV as Da,cW as Ka,cX as Oa,cY as Ua,cZ as Wa,c_ as Xa,c$ as Ya,m as Za,o as l,r as T,v as t,w as Ga,n as Ja,ad as ae,x as q,b9 as ee,d0 as te,d1 as se,c0 as oe,d2 as re,aq as le,c3 as _e,d3 as ie,d4 as ne,d5 as ce,d6 as ve,d7 as de}from"./toolbox-CSYBKDGJ.js";import{c as pe,d as ge}from"./utils-B5uxoJst.js";import{T as me,t as H,a as ue}from"./tool-seo-B_rVr-By.js";import{formatOutputName as he}from"./filename-DHpEjeWo.js";import"./rotate-cw-BkPYdDrq.js";function fe(C,y){const Q=$a(y,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3"}],["path",{d:"M21 21v.01"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7"}],["path",{d:"M3 12h.01"}],["path",{d:"M12 3h.01"}],["path",{d:"M12 16v.01"}],["path",{d:"M16 12h1"}],["path",{d:"M21 12v.01"}],["path",{d:"M12 21v-1"}]];ka(C,Ma({name:"qr-code"},()=>Q,{get iconNode(){return i},children:(v,f)=>{var d=Ta(),g=Ca(d);Qa(g,y,"default",{}),w(v,d)},$$slots:{default:!0}}))}var xe=T("<button> </button>"),be=T('<p class="text-sm text-failure"> </p>'),qe=T('<div class="result-box svelte-1xj6gh8"><p class="text-sm font-medium"> </p> <button class="btn"> </button></div>'),we=T('<div class="qr-page svelte-1xj6gh8"><!> <div class="preview-wrap svelte-1xj6gh8"><canvas class="qr-canvas svelte-1xj6gh8"></canvas></div> <div class="opt-section svelte-1xj6gh8"><div class="field svelte-1xj6gh8"><label for="qr-text" class="field-label svelte-1xj6gh8"> </label> <input id="qr-text" type="text" placeholder="https://example.com" class="field-input svelte-1xj6gh8"/></div> <div class="opt-row svelte-1xj6gh8"><span class="opt-label svelte-1xj6gh8"> </span> <input type="range" class="slider flex-1 svelte-1xj6gh8"/> <span class="val svelte-1xj6gh8"> </span></div> <div class="opt-row svelte-1xj6gh8"><span class="opt-label svelte-1xj6gh8"> </span> <input type="color" class="color-input svelte-1xj6gh8"/> <span class="opt-label svelte-1xj6gh8"> </span> <input type="color" class="color-input svelte-1xj6gh8"/></div> <div class="opt-row svelte-1xj6gh8"><span class="opt-label svelte-1xj6gh8"> </span> <div class="flex gap-2 flex-wrap"></div></div></div> <button class="btn highlight"> </button> <!> <!> <p class="text-xs text-muted mt-2"> </p> <!></div>');function Te(C,y){Ra(y,!0);const Q={"image_tools.tools.color_picker_name":ie,"image_tools.tools.watermark_name":_e,"dev_tools.tools.base64_name":le};let i=c("https://localconvert.app"),v=c(300),f=c("#000000"),d=c("#ffffff"),g=c("M"),x=c(""),b=c(null),p=c(void 0),m=null;Ba(()=>{a(i),a(v),a(f),a(d),a(g),_(b,null),!(!a(p)||!a(i).trim())&&(m!==null&&cancelAnimationFrame(m),m=requestAnimationFrame(()=>{ea(),m=null}))}),La(()=>{m!==null&&cancelAnimationFrame(m)});async function ea(){if(!(!a(p)||!a(i).trim()))try{await(await Fa(async()=>{const{default:o}=await import("./browser-CTB2jwNe.js").then(r=>r.b);return{default:o}},[],import.meta.url)).default.toCanvas(a(p),a(i),{width:a(v),margin:2,color:{dark:a(f),light:a(d)},errorCorrectionLevel:a(g)}),_(x,"")}catch(e){_(x,e instanceof Error?e.message:aa(),!0)}}async function ta(){if(a(p))try{_(b,await pe(a(p),"png"),!0)}catch{_(x,aa(),!0)}}function sa(){a(b)&&ge(a(b),he("qrcode","","png"))}const oa=[{value:"L",label:Pa()},{value:"M",label:za()},{value:"Q",label:Aa()},{value:"H",label:Ha()}];var I=we(),S=t(I);{let e=q(se),o=q(te),r=q(ee);me(S,{category:"image",get title(){return a(e)},get description(){return a(o)},get icon(){return fe},backHref:"/image-tools/",get backLabel(){return a(r)}})}var E=s(S,2),ra=t(E);Ia(ra,e=>_(p,e),()=>a(p));var F=s(E,2),N=t(F),V=t(N),la=t(V),_a=s(V,2),D=s(N,2),K=t(D),ia=t(K),u=s(K,2);h(u,"min",100),h(u,"max",800),h(u,"step",50);var na=s(u,2),ca=t(na),O=s(D,2),U=t(O),va=t(U),R=s(U,2),W=s(R,2),da=t(W),X=s(W,2),pa=s(O,2),Y=t(pa),ga=t(Y),ma=s(Y,2);Sa(ma,21,()=>oa,ae,(e,o)=>{var r=xe(),n=t(r);k(()=>{Ja(r,1,`btn text-xs px-2.5 py-1 ${a(g)===a(o).value?"highlight":""}`),l(n,a(o).label)}),A("click",r,()=>_(g,a(o).value,!0)),w(e,r)});var j=s(F,2),ua=t(j),Z=s(j,2);{var ha=e=>{var o=be(),r=t(o);k(()=>l(r,a(x))),w(e,o)};z(Z,e=>{a(x)&&e(ha)})}var G=s(Z,2);{var fa=e=>{var o=qe(),r=t(o),n=t(r),$=s(r,2),B=t($);k((L,P)=>{l(n,L),l(B,P)},[()=>oe(),()=>re()]),A("click",$,sa),w(e,o)};z(G,e=>{a(b)&&e(fa)})}var J=s(G,2),xa=t(J),ba=s(J,2);{var qa=e=>{{let o=q(()=>H["img-qr"].faqKeys.length>=4?[{q:ce?.()??"",a:ne?.()??""},{q:de?.()??"",a:ve?.()??""}]:[]),r=q(()=>H["img-qr"].related.map(n=>({href:n.href,name:Q[n.nameKey]?.()??"",icon:n.icon})));ue(e,{get faqs(){return a(o)},get relatedTools(){return a(r)}})}};z(ba,e=>{H["img-qr"]&&e(qa)})}k((e,o,r,n,$,B,L,P,wa,ya,ja)=>{l(la,e),l(ia,o),h(u,"aria-label",r),l(ca,`${a(v)??""}px`),l(va,n),h(R,"aria-label",$),l(da,B),h(X,"aria-label",L),l(ga,P),j.disabled=wa,l(ua,ya),l(xa,ja)},[()=>Na(),()=>Va(),()=>Da(),()=>Ka(),()=>Oa(),()=>Ua(),()=>Wa(),()=>Xa(),()=>!a(i).trim(),()=>Ya(),()=>Za()]),M(_a,()=>a(i),e=>_(i,e)),M(u,()=>a(v),e=>_(v,e)),M(R,()=>a(f),e=>_(f,e)),M(X,()=>a(d),e=>_(d,e)),A("click",j,ta),w(C,I),Ea()}Ga(["click"]);export{Te as default};
