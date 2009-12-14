/**
 * Tab
 */

var Tab = (function(){
  function yankUrl() {
    Clipboard.copy(document.location);
  }

	return {
    yankUrl : yankUrl,
		reload : function() { location.reload(); },
		reloadAll : function() {
			var port = chrome.extension.connect();
			port.postMessage({action: "reload_all_tabs"});
		},
		close : function() {
			var port = chrome.extension.connect();
			port.postMessage({action: "close_tab"});
		},
		reopen : function() {
			var port = chrome.extension.connect();
			port.postMessage({action: "reopen_tab"});
		},
		prev : function() {
			var port = chrome.extension.connect();
			port.postMessage({action: "previous_tab"});
		},
		next : function() {
			var port = chrome.extension.connect();
			port.postMessage({action: "next_tab"});
		}
	}
})()
