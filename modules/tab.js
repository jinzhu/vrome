/**
 * Tab
 */

var Tab = (function(){
  function yankUrl() {
    Clipboard.copy(document.location);
  }

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


	return {
    yankUrl   : yankUrl  ,
    reload    : reload   ,
    reloadAll : reloadAll,
    close     : close    ,
    reopen    : reopen   ,
    prev      : prev     ,
    next      : next     ,
	}
})()
