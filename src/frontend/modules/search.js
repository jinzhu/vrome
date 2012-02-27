var Search = (function(){
  var searchMode,direction,lastSearch,findTimeoutID;

  var highlight_class      = '__vrome_search_highlight';
  var highlight_current_id = '__vrome_search_highlight_current';

  function kill_find() {
    if (findTimeoutID) {
      clearTimeout(findTimeoutID);
      findTimeoutID = undefined;
    }
  }

  function find(keyword) {
    if (!keyword) { return; }
    kill_find();

    function do_find(keyword, node) {
      var processedNodes = 0;
      while (true) {
        while (node.hasChildNodes() && node.id != '_vrome_cmd_box' && !/(script|style)/i.test(node.tagName)) {
          node = node.firstChild;
        }
        if (node.nodeType == 3) { // text node
          var caseSensitive = /[A-Z]/.test(keyword);
          var key   = caseSensitive ? keyword   : keyword.toUpperCase();
          var text  = caseSensitive ? node.data : node.data.toUpperCase();
          var index = text.indexOf(key);

          if (index != -1) {
            processedNodes++;
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
              node = span;
            }
          }
        }
        while (!node.nextSibling) {
          node = node.parentNode;
          if (node === document.body) {
            findTimeoutID = undefined;
            return;
          }
        }
        node = node.nextSibling;
        if (processedNodes > 100) {
          findTimeoutID = setTimeout(do_find, 25, keyword, node);
          return;
        }
      }
    }
    findTimeoutID = setTimeout(do_find, 25, keyword, document.body);
  }

  function remove() {
    kill_find();

    var nodes = document.getElementsByClassName(highlight_class);
    var total_length = nodes.length;
    var from_length = total_length;
    if (from_length > 100) {
      from_length = 100
      setTimeout(remove, 25);
    }

    for (var i = from_length; i >= 0; i--) {
      if (nodes[i]) {
        var parentNode = nodes[i].parentNode;
        var text = nodes[i].innerText;

        var prevNode   = nodes[i].previousSibling;
        if (prevNode.nodeType == 3) {
          text = prevNode.data + text;
          parentNode.removeChild(prevNode);
        }

        var nextNode   = nodes[i].nextSibling;
        if (nextNode.nodeType == 3) {
          text = text + nextNode.data;
          parentNode.removeChild(nextNode);
        }

        var textNode = document.createTextNode(text);
        parentNode.replaceChild(textNode, nodes[i]);
      }
    }
    return parseInt(total_length / 100) * 25 + 5;
  }

  function next(step, totally_steps) {
		if (!searchMode) { return; }
    totally_steps = totally_steps || 0

    var offset = direction * step * times();
    var nodes = document.getElementsByClassName(highlight_class);
    if (nodes.length === 0) { return false; }

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id == highlight_current_id) {
        nodes[i].removeAttribute('id');
        break;
      }
    }

    // TODO refact me!
		i = (i + offset) % nodes.length;
		if (i < 0) { i +=	nodes.length; }

    CmdBox.blur();

    if (nodes[i] && isElementVisible(nodes[i], /* In full page*/ true)) {
      nodes[i].setAttribute('id',highlight_current_id);
      nodes[i].scrollIntoViewIfNeeded();
    } else if (totally_steps < nodes.length) {
      setTimeout(next, 5, step, totally_steps + step);
    }
  }

  function handleInput(e){
    var wait_time = 0;
		if (!searchMode) { return; }
    if (!isAcceptKey(getKey(e))) { wait_time = remove(); }

    setTimeout(find, wait_time, CmdBox.get().content);
    lastSearch = CmdBox.get().content;
  }

  function start(backward){
    searchMode = true;
    direction = backward ? -1 : 1 ;

    CmdBox.set({
			title   : backward ? 'Backward search: ?' : 'Forward search: /',
			pressUp : handleInput,
			content : getSelected() || lastSearch || ''
	  });
  }

  function stop() {
		if (!searchMode) { return; }
    searchMode = false;
    remove();
  }

  function useSelectedValueAsKeyword() {
    lastSearch = getSelected();
		return lastSearch;
  }

  function openCurrent(new_tab) {
		if (!searchMode) { return; }
    var elem = document.getElementById(highlight_current_id);

    var options = {};
		options[Platform.mac ? 'meta' : 'ctrl'] = new_tab;
    clickElement(elem, options);
  }

  return {
    start    : start,
    stop     : stop,
    backward : function() { start(true); },
    prev     : function() { next(-1); },
    next     : function() { next(1);  },
    forwardCursor  : function() { if (useSelectedValueAsKeyword()) { start(); } },
    backwardCursor : function() { if (useSelectedValueAsKeyword()) { start(true); } },
    openCurrent : function() { openCurrent(false) },
    openCurrentNewTab : function() { openCurrent(true) }
  };
})();
