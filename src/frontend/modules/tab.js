var Tab = (function(){

  function copyUrl() {
    var url = document.location.href;
		Clipboard.copy(url);
    CmdBox.set({ title : "[Copied] " + url, timeout : 4000 });
  }

  function reload(){
    location.reload();
  }

  function reloadAll() {
		Post({action: "Tab.reloadAll"});
	}

  function close(option) {
    option = option || {};
    option.action = 'Tab.close';
		Post(option);
  }

  function reopen() {
		Post({action: "Tab.reopen",num: times()});
	}

  function pin() {
		Post({action: "Tab.update",pinned: true});
  }

  function unpin() {
		Post({action: "Tab.update",pinned: false});
  }

  function selectPrevious() {
    var count = times(/*raw*/ true);

    if (count) {
      Post({ action: "Tab.goto", index: count - 1});
    } else {
      Post({ action: "Tab.selectPrevious" });
    }
  }

  function prev()  { Post({action: "Tab.goto",offset : -1 * times()}); }
  function next()  { Post({action: "Tab.goto",offset : times()}); }
  function first() { Post({action: "Tab.goto",index  :	0}); }
  function last()  { Post({action: "Tab.goto",index  : -1}); }

  // API
	return {
    copyUrl   : copyUrl	 ,
    reload    : reload   ,
    reloadAll : reloadAll,

    close     : close    ,
		closeAndFoucsLast : function(){ close({focusLast: true}); },
		closeAndFoucsLeft : function(){ close({offset: -1}); },
    reopen    : reopen   ,

    pin       : pin      ,
    unpin     : unpin    ,

    prev      : prev     ,
    next      : next     ,
    first     : first    ,
    last      : last     ,
    selectPrevious : selectPrevious
	};
})();
