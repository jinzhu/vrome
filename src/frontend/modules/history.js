var History = (function() {
  var isEnabled, newTab, multiMode, historys, last_keyword;

  function start(new_tab, multi_mode) {
    isEnabled = true;
    newTab    = new_tab;
    multiMode = multi_mode;
    last_keyword = null;

    Dialog.start();
    CmdBox.set({title : 'History',pressDown : handleInput,content : ''});
    search("");
  }

  function openCurrent() {
    if (!isEnabled) { return false; }

    var options = {};
    options[Platform.mac ? 'meta' : 'ctrl'] = newTab;
    clickElement(Dialog.current(), options);
  }

  function handleInput(e) {
    var key = getKey(e);

    if ((key == '<Up>') || (key == '<S-Tab>')) {
      Dialog.prev();
      KeyEvent.stopPropagation(e);
      return;
    }
    if ((key == '<Down>') || (key == '<Tab>')) {
      Dialog.next();
      KeyEvent.stopPropagation(e);
      return;
    }
    if (!isEscapeKey(key)) { setTimeout(delayToWaitKeyDown,200); }
  }

  function delayToWaitKeyDown() {
    var keyword = CmdBox.get().content;
    if (last_keyword !== keyword) {
      search(keyword);
      last_keyword = keyword;
    }
  }

  function search(keyword) {
    Post({action: "History.search", keyword: keyword});
  }

  function stop() {
    Dialog.stop();
    isEnabled = false;
  }

  return {
    back    : function(){ history.go(-1 * times()); },
    forward : function(){ history.go( 1 * times()); },
    start : start,
    new_tab_start    : function(){ start(/*new tab*/ true); },
    openCurrent : openCurrent,
    stop : stop
  };
})();
