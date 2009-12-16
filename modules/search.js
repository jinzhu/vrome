var Search = (function(){
  var highlight_class = '__vimlike_search_highlight';
  var current_id = '__vimlike_search_highlight_current';
  var step = 1;

  function find(keyword,node) {
    if(!keyword) return;
    if(!node) node = document.body;

    // Iterate node childNodes
    if (node.id != '__vimlike_cmd_box' && node.hasChildNodes() && !/(script|style)/i.test(node.tagName)) {
      for (var i = 0;i < node.childNodes.length;i++) {
        find(keyword, node.childNodes[i]);
      }
    }

    if (node.nodeType == 3) { // text node
      var tmpKey = keyword.toUpperCase();
      var tmpText = node.data.toUpperCase();
      var ni = tmpText.indexOf(tmpKey);
      if (ni != -1) {
        var pn = node.parentNode;

        if (pn.className != highlight_class) {
          var nv = node.data;

          var before = document.createTextNode(nv.substr(0,ni));
          var match  = document.createTextNode(nv.substr(ni,keyword.length));
          var after  = document.createTextNode(nv.substr(ni+keyword.length));

          var hiLabel = document.createElement("span");
          hiLabel.className = highlight_class;
          hiLabel.appendChild(match);
          pn.insertBefore(before,node);
          pn.insertBefore(hiLabel,node);
          pn.insertBefore(after,node);
          pn.removeChild(node);
        }
      }
    }
  }

  function remove() {
    step = 1;
    var nodes = document.getElementsByClassName(highlight_class);
    var length = nodes.length;
    for(var i = 0; i < length; i++){
      if(nodes[0]){
        var pn = nodes[0].parentNode;
        pn.innerHTML = pn.innerText;
      }
    }
  }

  function next(direction) {
    direction = direction * step;
    var nodes = document.getElementsByClassName(highlight_class);
    if(nodes.length == 0) return false;

    for(var i = 0; i < nodes.length; i++){
      if (nodes[i].id == current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }

    if(direction == 1){
      i == nodes.length ? (i = 0) : i++ ;
    }else{
      i == 0 ? (i = nodes.length - 1) : i-- ;
    }
    nodes[i].setAttribute('id',current_id);
  }

  function handleInput(e){
    remove();
    find(CmdLine.get().content);
  }

  function start(backward){
    if(backward) step = -1;
    CmdLine.set({title : 'SearchMode',pressUp : handleInput,content : ''});
    document.getElementById('__vimlike_cmd_input_box').focus();
  }

  return {
    start    : start,
    backward : function(){ start(true) },
    remove   : remove,
    prev     : function(){ next(-1) },
    next     : function(){ next(1) },
  }
})()
