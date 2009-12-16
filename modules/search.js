var Search = (function(){
  var highlight_class = '__vimlike_search_highlight';
  var current_id = '__vimlike_search_highlight_current';

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
    var nodes = document.getElementsByClassName(highlight_class);
    var length = nodes.length;
    for(var i = 0; i < length; i++){
      if(nodes[0]){
        var pn = nodes[0].parentNode;
        pn.innerHTML = pn.innerText;
      }
    }
  }

  function next() {
    var nodes = document.getElementsByClassName(highlight_class);
    if(nodes.length == 0) return false;

    for(var i = 0; i < nodes.length; i++){
      if (nodes[i].id == current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }
    if(i == nodes.length) i = -1;
    nodes[i + 1].setAttribute('id',current_id);
  }

  function prev() {
    var nodes = document.getElementsByClassName(highlight_class);
    if(nodes.length == 0) return false;

    for(var i = 0; i < nodes.length; i++){
      if (nodes[i].id == current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }
    if(i == 0) i = nodes.length;
    nodes[i - 1].setAttribute('id',current_id);
  }

  function handleInput(e){
    remove();
    find(CmdLine.get().content);
  }

  function start(){
    CmdLine.set({title : 'SearchMode',pressUp : handleInput,content : ''});
    document.getElementById('__vimlike_cmd_input_box').focus();
  }

  return {
    start  : start,
    remove : remove
  }
})()
