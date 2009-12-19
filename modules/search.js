var Search = (function(){
  var searchMode = false;
  var direction;
  var lastSearch;

  var highlight_class      = '__vimlike_search_highlight';
  var highlight_current_id = '__vimlike_search_highlight_current';

  function find(keyword,node) {
    if(!keyword) return;
    if(!node)    node = document.body;

    // Iterate node childNodes
    if (node.id != '__vimlike_cmd_box' && node.hasChildNodes() && !/(script|style)/i.test(node.tagName)) {
      for (var i = 0;i < node.childNodes.length;i++) {
        find(keyword, node.childNodes[i]);
      }
    }

    if (node.nodeType == 3) { // text node
      var caseSensitive = /[A-Z]/.test(keyword);
      var key   = caseSensitive ? keyword   : keyword.toUpperCase();
      var text  = caseSensitive ? node.data : node.data.toUpperCase();
      var index = text.indexOf(key);

      if (index != -1) {
        var parentNode = node.parentNode;

        if (parentNode.className != highlight_class) {
          var nodeData = node.data;

          var before = document.createTextNode(nodeData.substr(0,index));
          var match  = document.createTextNode(nodeData.substr(index,keyword.length));
          var after  = document.createTextNode(nodeData.substr(index + keyword.length));

          var span = document.createElement("span");
          span.setAttribute('class',highlight_class);
          span.appendChild(match);

          parentNode.insertBefore(before, node);
          parentNode.insertBefore(span  , node);
          parentNode.insertBefore(after , node);
          parentNode.removeChild(node);
        }
      }
    }
  }

  function remove() {
    var nodes = document.getElementsByClassName(highlight_class);
    var length = nodes.length;

    for(var i = 0; i < length; i++){
      if(nodes[0]){
        var parentNode = nodes[0].parentNode;
        parentNode.innerHTML = parentNode.innerText;
      }
    }
  }

  function next(step) {
		if(!searchMode) return;

    var offset = direction * step * times();
    var nodes = document.getElementsByClassName(highlight_class);
    if(nodes.length == 0) return false;

    for(var i = 0; i < nodes.length; i++){
      if (nodes[i].id == highlight_current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }

		i = (i + offset) % nodes.length
		if (i < 0) i +=	nodes.length;

    Debug('Search.next - size:' + nodes.length + ' selected:' + i + ' direction:' + direction + ' offset:' + offset);

    if(nodes[i]){ // if undefined,then goto next
      nodes[i].setAttribute('id',highlight_current_id);
      // TODO only move if the node is invisible?
      if(!isElementVisible(nodes[i])) nodes[i].scrollIntoView();
    }else{
      next(step);
    }
  }

  function handleInput(e){
		if(!searchMode) return;

    key = getKey(e);
    if( ! /Enter/.test(key) ) remove(); // clear exist highlight before search

    find(CmdLine.get().content);
    lastSearch = CmdLine.get().content;
  }

  function start(backward){
    searchMode = true;
    direction = backward ? -1 : 1 ;

    CmdLine.set({
			title   : backward ? 'Backward search: ?' : 'Forward search: /',
			pressUp : handleInput,
			content : lastSearch || ''
	  });
  }

  function stop(){
		if(!searchMode) return;
    searchMode = false;
    remove();
  }

  function useSelectedValueAsKeyword() {
    var value  = window.getSelection().focusNode.data;
    var range  = window.getSelection().getRangeAt();
    lastSearch = value.substring(range.startOffset,range.endOffset);
		return lastSearch;
  }

  return {
    start    : start,
    stop     : stop,
    backward : function() { start(true); },
    prev     : function() { next(-1); },
    next     : function() { next(1);  },
    forwardCursor  : function() { if(useSelectedValueAsKeyword){ start(); } },
    backwardCursor : function() { if(useSelectedValueAsKeyword){ start(true); } },
  }
})()
