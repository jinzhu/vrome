var Tab = (function(){

  function yankUrl(/*Boolean*/ copy) {
		if(copy){
			Clipboard.copy(document.location);
		}else{
			Clipboard.yank(document.location);
		}
  }
	function copyUrl() { yankUrl(true); }

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
		Post({action: "reopenTab"});
	}

  function lastSelected() {
		Post({action: "lastSelectedTab"});
  }

  function prev()  { Post({action: "gotoTab",offset : -1 * times()}); }
  function next()  { Post({action: "gotoTab",offset : times()}); }
  function first() { Post({action: "gotoTab",index  :	0}); }
  function last()  { Post({action: "gotoTab",index : -1}); }

	return {
    yankUrl   : yankUrl  ,
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
