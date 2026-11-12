import{r as c,j as e}from"./toolbox-C1bqIItI.js";import{F as x}from"./panel-BS_kjOg7.js";import{T as E}from"./text-tool-DKzwReiD.js";import{S as d}from"./switch-CtKsE6C3.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";import"./KeyCode-HJ8jGXz0.js";const u=" ";function oe(){const[l,C]=c.useState(!0),[a,$]=c.useState(!0),[o,N]=c.useState(!0),[h,k]=c.useState(!0),L=c.useCallback(n=>{if(!n)return"";const m=(n.match(/\r\n/g)??[]).length,p=(n.match(/(?<!\r)\n/g)??[]).length,f=(n.match(/\r(?!\n)/g)??[]).length,r=[];m>0&&r.push(`CRLF x${m}`),p>0&&r.push(`LF x${p}`),f>0&&r.push(`CR x${f}`);const g=(m>0?1:0)+(p>0?1:0)+(f>0?1:0),y=g===0?"none":g>1?`mixed (${r.join(", ")})`:r[0]??"none",T=n.split(/\r\n|\r|\n/),v=new RegExp(`[ \\t${u}]$`);let w=0;for(const t of T)v.test(t)&&(w+=1);let j=0,b=0,S=0;for(const t of n)t===" "?j+=1:t==="	"?b+=1:t===u&&(S+=1);const F=m+p+f;let s="";for(let t=0;t<n.length;t+=1){const i=n[t]??"";if(i==="\r"){(n[t+1]??"")===`
`?(s+=o?`␍␊
`:`\r
`,t+=1):s+=o?`␍
`:"\r";continue}if(i===`
`){s+=o?`¶
`:`
`;continue}if(i==="	"){s+=a?"→	":"	";continue}if(i===" "){s+=l?"·":" ";continue}if(i===u){s+=h?"⍽":u;continue}s+=i}const R=["--- Summary ---",`Line endings: ${y}`,`Spaces: ${j}`,`Tabs: ${b}`,`Newlines: ${F}`,`Non-breaking spaces: ${S}`,`Lines with trailing whitespace: ${w}`].join(`
`);return`${s}

${R}`},[l,a,o,h]);return e.jsx(E,{transform:L,deps:[l,a,o,h],inputLabel:"文本",outputLabel:"可视化",sample:`function  hi() {
	return  42;   
}
trailing spaces above`,downloadName:"whitespace.txt",options:e.jsxs(e.Fragment,{children:[e.jsx(x,{label:"空格（中点）",children:e.jsx("div",{className:"flex h-8 items-center",children:e.jsx(d,{checked:l,onCheckedChange:C})})}),e.jsx(x,{label:"选项卡（箭头）",children:e.jsx("div",{className:"flex h-8 items-center",children:e.jsx(d,{checked:a,onCheckedChange:$})})}),e.jsx(x,{label:"换行符（pilcrow）",children:e.jsx("div",{className:"flex h-8 items-center",children:e.jsx(d,{checked:o,onCheckedChange:N})})}),e.jsx(x,{label:"不间断空格",children:e.jsx("div",{className:"flex h-8 items-center",children:e.jsx(d,{checked:h,onCheckedChange:k})})})]})})}export{oe as default};
