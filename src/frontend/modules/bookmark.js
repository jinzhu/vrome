var Bookmark = (function() {
  var isEnabled, newTab, multiMode, bookmarks;

  function start(new_tab, multi_mode) {
    isEnabled = true;
    newTab    = new_tab;
    multiMode = multi_mode;

    CmdBox.set({title : 'Bookmark',pressDown : handleInput,content : ''});
  }

  function openCurrent() {
    var options = {};
    options[Platform.mac ? 'meta' : 'ctrl'] = newTab;
    clickElement(Dialog.current(), options);
  }

  function handleInput(e) {
    var key = getKey(e);

    if ((key == '<Up>') || (key == '<S-Tab>')) { return Dialog.prev(); }
    if ((key == '<Down>') || (key == '<Tab>')) { return Dialog.next(); }
    if (isAcceptKey(key)) { return openCurrent(); }
    if (!isEscapeKey(key)) { setTimeout(delayToWaitKeyDown,200); }
  }

  function delayToWaitKeyDown() {
    Post({action: "Bookmark.search", keyword: CmdBox.get().content});
  }

  return {
    start : start,
    new_tab_start    : function(){ start(/*new tab*/ true); },
    multi_mode_start : function(){ start(/*new tab*/ true, /*multi mode*/ true); }
  }
})();
