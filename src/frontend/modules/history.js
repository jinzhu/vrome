var History = (function() {
  function start(new_tab) {
    Dialog.start('History', '', search, new_tab);
  }

  function search(keyword) {
    Post({action: "History.search", keyword: keyword});
  }

  return {
    back    : function(){ history.go(-1 * times()); },
    forward : function(){ history.go( 1 * times()); },
    start : start,
    new_tab_start : function(){ start(/*new tab*/ true); }
  };
})();
