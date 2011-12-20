var Marks = (function() {

  function addQuickMark(msg) {
    var url_marks      = Settings.get('url_marks') || {};
    url_marks[msg.key] = msg.url;
    Settings.add('url_marks',url_marks);
    syncSetting(Tab.now_tab);
  }

  function addLocalMark(msg) {
    var local_marks = Settings.get('local_marks') || {};
    local_marks[msg.key] = msg.position;
    Settings.add('local_marks', local_marks);
    syncSetting(Tab.now_tab);
  }

  return {
    addQuickMark : addQuickMark,
    addLocalMark : addLocalMark
  };
})();
