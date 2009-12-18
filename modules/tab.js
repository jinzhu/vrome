/**
 * Tab
 */

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
    var port = chrome.extension.connect();
    port.postMessage({action: "reload_all_tabs"});
	}

  function close() {
    var port = chrome.extension.connect();
    port.postMessage({action: "close_tab"});
  }

  function reopen() {
		var port = chrome.extension.connect();
		port.postMessage({action: "reopen_tab"});
	}

  function prev() {
		var port = chrome.extension.connect();
		port.postMessage({action: "previous_tab"});
	}

  function next() {
		var port = chrome.extension.connect();
		port.postMessage({action: "next_tab"});
	}

  function first() {
		var port = chrome.extension.connect();
		port.postMessage({action: "first_tab"});
	}

  function last() {
		var port = chrome.extension.connect();
		port.postMessage({action: "last_tab"});
	}

  function last_selected() {
		var port = chrome.extension.connect();
		port.postMessage({action: "last_selected_tab"});
  }

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
    last_selected : last_selected,
	}
})()
