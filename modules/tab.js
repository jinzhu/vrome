/**
 * Tab
 */

var Tab = new Object();

(function(){

	Tab.Reload = function() { location.reload(); };
	Tab.ReloadAll = function() {
		var port = chrome.extension.connect();
		port.postMessage({action: "reload_all_tabs"});
	}
	Tab.Close = function() {
		var port = chrome.extension.connect();
		port.postMessage({action: "close_tab"});
	}
	Tab.Reopen = function() {
		var port = chrome.extension.connect();
		port.postMessage({action: "reopen_tab"});
	}

	Tab.Prev = function() {
		var port = chrome.extension.connect();
		port.postMessage({action: "previous_tab"});
	}
	Tab.Next = function() {
		var port = chrome.extension.connect();
		port.postMessage({action: "next_tab"});
	}
})()
