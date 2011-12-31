var Marks = (function() {
  function addQuickMark() {
    Post({ action: "Marks.addQuickMark",key  : getKey(this),url : location.href });
    CmdBox.set({title : "Add Quick Mark " + getKey(this) ,timeout : 1000 });
  }

  function gotoQuickMark(/*Boolean*/ newtab) {
    var key = getKey(this);
    var url = Settings.get("background.url_marks")[key];
    Post({ action: "Tab.openUrl", urls: url, newtab: newtab });
  }

  function addLocalMark() {
    // TODO zoom
    var key = getKey(this);
    if (key.match(/^[A-Z]$/)) {
      Post({action : "Marks.addLocalMark",key : key, position : [scrollX, scrollY, location.href]});
    } else {
      var local_marks = Settings.get('local_marks') || {};
      local_marks[key] = [scrollX, scrollY];
      Settings.add('local_marks',local_marks);
    }
    CmdBox.set({title : "Add Local Mark " + key,timeout : 1000 });
  }

  function gotoLocalMark() {
    var key = getKey(this);
    var setting_key = key.match(/^[A-Z]$/) ? 'background.local_marks' : 'local_marks';
    var position = Settings.get(setting_key)[key];
    if (position instanceof Array) {
      if (position[2]) {
        Post({action: "Tab.update", url: position[2], callback: "scrollTo(" + position[0] + "," + position[1] + ")"});
      } else {
        scrollTo(position[0], position[1]);
      }
    }
  }

  return {
    addQuickMark        : addQuickMark,
    gotoQuickMark       : gotoQuickMark,
    gotoQuickMarkNewTab : function() { gotoQuickMark.call(this,true); },
    addLocalMark        : addLocalMark,
    gotoLocalMark       : gotoLocalMark
  };
})();
