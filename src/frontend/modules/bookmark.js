var Bookmark = (function() {
  function start(new_tab) {
    Dialog.start('Bookmark', '', search, new_tab);
  }

  function search(keyword) {
    Post({action: "Bookmark.search", keyword: keyword});
  }

  return {
    start : start,
    new_tab_start : function(){ start(/*new tab*/ true); }
  }
})();
