/* Shared local SVG renderer; tool names and format badges never enter HTML. */
(() => {
 const paths=ToolboxIconPaths;
 function svg(name){
  const node=document.createElementNS('http://www.w3.org/2000/svg','svg');
  node.setAttribute('viewBox','0 0 24 24');
  node.setAttribute('aria-hidden','true');
  node.setAttribute('focusable','false');
  node.innerHTML=paths[name]||paths.wrench||paths['layout-grid'];
  return node;
 }
 function tile(tool,className='tool-icon'){
  const node=document.createElement('span');node.className=className;
  node.setAttribute('aria-hidden','true');node.dataset.icon=tool.icon;
  node.append(svg(tool.icon));
  if(tool.iconBadge){const label=document.createElement('span');label.className='icon-format';label.textContent=tool.iconBadge;node.append(label);node.classList.add('has-format');}
  return node;
 }
 window.ToolboxIcons={svg,tile};
})();
