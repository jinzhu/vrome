var Tab = (function() {
  function close(msg) {
    var tab = arguments[arguments.length-1];
    Tab.current_closed_tab = tab;
    chrome.tabs.remove(tab.id);
    if (msg.focusLast) selectPrevious.apply('',arguments); // close and selects last
    if (msg.offset) goto.apply('',arguments);            // close and select left
  }

  function reopen(msg) {
    if (Tab.closed_tabs.length > 0) {
      var index = Tab.closed_tabs.length - msg.num;
      var last_closed_tab = Tab.closed_tabs[Tab.closed_tabs.length - msg.num];
      Debug("last_closed_tab: " + last_closed_tab);
      if (last_closed_tab) {
        Tab.closed_tabs.splice(index,1);
        chrome.tabs.create({url: last_closed_tab.url, index: last_closed_tab.index});
      }
    }
  }

  function goto(msg) {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      if (typeof msg.index != 'undefined') { var index = msg.index; }
      if (typeof msg.offset != 'undefined') { var index = tab.index + msg.offset; }

      if (index) {
        index = index % tabs.length;
        if (index < 0) { index = index + tabs.length; }
      }

      Debug("gotoTab:" + index + " index:" + msg.index + " offset:" + msg.offset);
      var get_tab = tabs[index] || tab;
      chrome.tabs.update(get_tab.id, {selected: true});
    });
  }

  function selectPrevious() {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      chrome.tabs.update(Tab.last_selected_tab.id, {selected: true});
    });
  }

  function reloadAll(msg) {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      for (var i in tabs) {
        var tab = tabs[i];
        chrome.tabs.update(tab.id, {url: tab.url, selected: tab.selected}, null);
      }
    });
  }

  function open_url(msg) {
    var tab       = arguments[arguments.length-1];
    var urls      = msg.urls || msg.url;
    if (typeof urls == 'string') urls = [urls];
    var first_url = urls.shift();
    var index     = tab.index;

    if (msg.newtab) {
      chrome.tabs.create({url: first_url, index: ++index});
    } else {
      chrome.tabs.update(tab.id, {url: first_url});
    }
    for (var i = 0;i < urls.length;i++) {
      chrome.tabs.create({url: urls[i], index: ++index,selected: false});
    }
  }

  return {
    close          : close,
    reopen         : reopen,
    goto           : goto,
    selectPrevious : selectPrevious,
    reloadAll      : reloadAll,
    open_url       : open_url
  }
})()

// Tab.closed_tabs, now_tab, last_selected_tab, current_closed_tab;
Tab.closed_tabs = [];
