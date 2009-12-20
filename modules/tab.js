var Tab = (function(){

  function copyUrl() {
		Clipboard.copy(document.location);
  }

  function reload(){
    location.reload();
  }

  function reloadAll() {
		Post({action: "reloadAllTabs"});
	}

  function close() {
		Post({action: "closeTab"});
  }

  function reopen() {
		Post({action: "reopenTab",num : times()});
	}

  function lastSelected() {
		Post({action: "lastSelectedTab"});
  }

  function prev()  { Post({action: "gotoTab",offset : -1 * times()}); }
  function next()  { Post({action: "gotoTab",offset : times()}); }
  function first() { Post({action: "gotoTab",index  :	0}); }
  function last()  { Post({action: "gotoTab",index : -1}); }

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
	}
})()
