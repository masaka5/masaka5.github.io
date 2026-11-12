/* Local integration adapter; upstream engine stays unmodified. */
checkAllLoaded = function () {
 if (mxScriptsLoaded && mxWinLoaded) {
  // Keep native local editing menus; cloud/file/help entry points belong to the host shell.
  Menus.prototype.defaultMenuItems = ['edit', 'view', 'arrange'];
  // Native palette seed labels are data, separate from the Chinese menu bundle.
  var chinese={Text:'文本',Heading:'标题','Vertical Container':'纵向容器','Horizontal Container':'横向容器',List:'列表','Item 1':'项目一','Item 2':'项目二','Item 3':'项目三','List Item':'列表项'};
  var visit=function(root){var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){var n=walker.currentNode,t=n.nodeValue.trim();if(chinese[t])n.nodeValue=n.nodeValue.replace(t,chinese[t]);else if(t.indexOf('Lorem ipsum dolor')===0)n.nodeValue='双击编辑文本内容';}};
  new MutationObserver(function(changes){changes.forEach(function(change){change.addedNodes.forEach(function(node){if(node.nodeType===1 && node.closest('.geSidebarContainer'))visit(node);});});}).observe(document.body,{childList:true,subtree:true});
  App.main(function (ui) {
   window.toolboxEditor = ui;
   // Route document files through the host's bounded XML importer.
   document.addEventListener('drop',function(e){if(e.dataTransfer?.files?.length){e.preventDefault();e.stopImmediatePropagation();parent.document.getElementById('importFile').click();}},true);
   document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='o'){e.preventDefault();e.stopImmediatePropagation();parent.document.getElementById('importFile').click();}},true);
   ui.hideDialog();
   ui.spinner.stop();
   ui.editor.graph.setEnabled(true);
   var splash=document.getElementById('geInfo');
   if(splash) splash.remove();
   ui.menus.defaultMenuItems = ['edit', 'view', 'arrange'];
   if (ui.menubar) { ui.menubar.container.innerHTML=''; ui.menus.createMenubar(ui.menubar.container); }
   if (innerWidth < 600) { ui.toggleFormatPanel(false); }
   parent.postMessage({type:'toolbox-drawio-ready'}, location.origin);
  });
 }
};
