var Bookmark = (function() {
  var isEnabled, newTab, multiMode, bookmarks, last_keyword;

  function start(new_tab, multi_mode) {
    isEnabled = true;
    newTab    = new_tab;
    multiMode = multi_mode;
    last_keyword = null;

    Dialog.start();
    CmdBox.set({title : 'Bookmark',pressDown : handleInput,content : ''});
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
      Post({action: "Bookmark.search", keyword: CmdBox.get().content});
      last_keyword = keyword;
    }
  }

  function stop() {
    Dialog.stop();
    isEnabled = false;
  }

  return {
    start : start,
    new_tab_start    : function(){ start(/*new tab*/ true); },
    multi_mode_start : function(){ start(/*new tab*/ true, /*multi mode*/ true); },
    openCurrent : openCurrent,
    stop : stop
  }
})();
