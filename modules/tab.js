var Tab = (function(){

  function copyUrl() {
		Clipboard.copy(document.location);
  }

  function reload(){
    location.reload();
  }

  function reloadAll() {
		Post({action: "Tab.reloadAll"});
	}

  function close(argu) {
		Post({action: "Tab.close",arguments : argu});
  }

  function reopen() {
		Post({action: "Tab.reopen",num : times()});
	}

  function lastSelected() {
		Post({action: "Tab.lastSelected"});
  }

  function prev()  { Post({action: "Tab.goto",offset : -1 * times()}); }
  function next()  { Post({action: "Tab.goto",offset : times()}); }
  function first() { Post({action: "Tab.goto",index  :	0}); }
  function last()  { Post({action: "Tab.goto",index  : -1}); }

	return {
    copyUrl   : copyUrl	 ,
    reload    : reload   ,
    reloadAll : reloadAll,
    close     : close    ,
    reopen    : reopen   ,
    prev      : prev     ,
    next      : next     ,
    first     : first    ,
    last      : last     ,
    lastSelected : lastSelected,
		closeAndFoucsLast : function(){ close({focusLast : true}) },
		closeAndFoucsLeft : function(){ close({offset : -1}) },
	}
})()
