var Search = (function(){
  var searchMode = false;
  var direction;

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
      var key = keyword.toUpperCase();
      var text = node.data.toUpperCase();
      var index = text.indexOf(key);
      if (index != -1) {
        var parentNode = node.parentNode;

        if (parentNode.className != highlight_class) {
          var nodeData = node.data;

          var before = document.createTextNode(nodeData.substr(0,index));
          var match  = document.createTextNode(nodeData.substr(index,keyword.length));
          var after  = document.createTextNode(nodeData.substr(index + keyword.length));

          var span = document.createElement("span");
          span.className = highlight_class;
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
    step = direction * step;
    var nodes = document.getElementsByClassName(highlight_class);
    if(nodes.length == 0) return false;

    for(var i = 0; i < nodes.length; i++){
      if (nodes[i].id == highlight_current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }

    if(step == 1){
      i == nodes.length ? (i = 0) : i++ ;
    }else{
      i == 0 ? (i = nodes.length - 1) : i-- ;
    }

    Debug('Search.next - size:' + nodes.length + ' selected:' + i + ' direction:' + direction + ' step:' + step);
    nodes[i].setAttribute('id',highlight_current_id);
  }

  function handleInput(e){
    key = KeyEvent.getKey(e);
    if( ! /Shift|Enter/.test(key) ) remove(); // clear exist highlight before search

    find(CmdLine.get().content);
  }

  function start(backward){
    searchMode = true;
    direction = backward ? -1 : 1 ;

    CmdLine.set({title : 'SearchMode',pressUp : handleInput,content : ''});
    document.getElementById('__vimlike_cmd_input_box').focus();
  }

  function stop(){
    searchMode = false;
    remove();
  }

  return {
    start    : start,
    backward : function(){
                 start(true)
               },
    stop     : function() {
                 Debug('Search.stop - Mode ' + searchMode);
                 if(!searchMode) return;
                 stop()
               },
    prev     : function() {
                 Debug('Search.prev - Mode ' + searchMode);
                 if(!searchMode) return;
                 next(-1);
               },
    next     : function() {
                 Debug('Search.next - Mode ' + searchMode);
                 if(!searchMode) return;
                 next(1)
               },
  }
})()
