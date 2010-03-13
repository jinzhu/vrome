var Marks = (function() {
  function addQuickMark() {
    Post({ action: "Marks.addQuickMark",key  : getKey(e),url : location.href });
  }

  function gotoQuickMark(/*Boolean*/ newtab) {
    var key = getKey(e);
    var url = Settings.get("background.url_marks")[key];
    Post({ action: "Tab.openUrl", urls: url, newtab: newtab });
  }

  function addLocalMark() {
    // TODO zoom
    var key = getKey(e);
    if (key.match(/^[A-Z]$/)) {
      Post({ action: "Marks.addLocalMark",key  : getKey(e),position : [scrollX, scrollY]});
    } else {
      var local_marks = Settings.get('local_marks') || {};
      local_marks[msg.key] = [scrollX, scrollY];
      Settings.add('url_marks',url_marks);
    }
  }

  function gotoLocalMark(/*String*/ key) {
    var key = getKey(e);
    var setting_key = key.match(/^[A-Z]$/) ? 'background.url_marks' : 'url_marks';
    var position = Settings.get(setting_key)[key];
    if (position instanceof Array) scrollTo(position[0],position[1]);
  }

  return {
    addQuickMark        : addQuickMark,
    gotoQuickMark       : gotoQuickMark,
    gotoQuickMarkNewTab : function() { gotoQuickMark(true) },
    addLocalMark        : addLocalMark,
    gotoLocalMark       : gotoLocalMark,
  }
})


//// QuickMarks
// go{a-zA-Z0-9} Jump to a QuickMark in the current tab.
// gn{a-zA-Z0-9} Jump to a QuickMark in a new tab.
// M{a-zA-Z0-9}  Add new QuickMark for current URL.

//// Local marks
// m{a-zA-Z} Set mark at the cursor position. Marks a-z are local to the buffer, whereas A-Z are valid between buffers.
// '{a-zA-Z} Jump to the mark.
