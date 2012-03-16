var Tab = (function() {
  function runWhenComplete(tabId, command) {
    chrome.tabs.get(tabId, function(tab) {
      if (tab.status == "complete") {
        chrome.tabs.executeScript(tabId, command);
      } else {
        runWhenComplete(tabId, command);
      }
    });
  }

  function autoComplete(msg) {
    var tab     = arguments[arguments.length-1];
    var keyword = msg.keyword;
    var return_urls = [];

    if (msg.default_urls) {
      var default_url = {};
      default_url.url = msg.default_urls;
      return_urls.push(default_url);
    }

    if (Option.get('noautocomplete')) {
      Post(tab, { action: "Dialog.draw", urls: return_urls, keyword: keyword });
    } else {
      chrome.bookmarks.search(keyword, function(bookmarks) {
        // Search start from 10 days ago
        chrome.history.search({text: keyword, maxResults: 30, startTime: (new Date().getTime() - 1000 * 60 * 60 * 24 * 10)}, function(historys) {
          Post(tab, { action: "Dialog.draw", urls: return_urls.concat(bookmarks.concat(historys)), keyword: keyword });
        });
      });
    }
  }

  function update(msg) {
    var tab  = arguments[arguments.length-1];
    var attr = {};

    if (typeof msg.url !== "undefined")         { attr.url = msg.url; }
    if (typeof msg.active !== "undefined")      { attr.active = msg.active; }
    if (typeof msg.highlighted !== "undefined") { attr.highlighted = msg.highlighted; }
    if (typeof msg.pinned !== "undefined")      { attr.pinned = msg.pinned; }

    chrome.tabs.update(tab.id, attr, function(new_tab) {
      if (msg.callback) {
        runWhenComplete(new_tab.id, {code:msg.callback});
      }
    });
  }

  function closeOtherTabs(tab) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      for (var i=0; i < tabs.length; i++) {
        if (tabs[i].id != tab.id) { chrome.tabs.remove(tabs[i].id); }
      }
    });
  }

  function closeLeftTabs(tab) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      for (var i=0; i < tabs.length; i++) {
        if (tabs[i].index < tab.index) { chrome.tabs.remove(tabs[i].id); }
      }
    });
  }

  function closeRightTabs(tab) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      for (var i=0; i < tabs.length; i++) {
        if (tabs[i].index > tab.index) { chrome.tabs.remove(tabs[i].id); }
      }
    });
  }

  function closePinnedTabs(tab, /*Boolean*/ close_unpinned) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      for (var i=0; i < tabs.length; i++) {
        if (close_unpinned) {
          if (!tabs[i].pinned) { chrome.tabs.remove(tabs[i].id); }
        } else {
          if (tabs[i].pinned) { chrome.tabs.remove(tabs[i].id); }
        }
      }
    });
  }

  function close(msg) {
    var tab = arguments[arguments.length-1];
    Tab.current_closed_tab = tab;

    if (msg.closeOther)  { return closeOtherTabs(tab); }
    if (msg.closeLeft)   { return closeLeftTabs(tab);  }
    if (msg.closeRight)  { return closeRightTabs(tab); }
    if (msg.closePinned) { return closePinnedTabs(tab); }
    if (msg.closeUnPinned) { return closePinnedTabs(tab, /* close unpinned */ true); }

    chrome.tabs.remove(tab.id);
    if (msg.focusLast) { selectPrevious.apply('',arguments); } // close and select right
    if (msg.offset)    { goto.apply('',arguments); }           // close and select left
  }

  function reopen(msg) {
    if (Tab.closed_tabs.length > 0) {
      var index = Tab.closed_tabs.length - msg.count;
      var last_closed_tab = Tab.closed_tabs[Tab.closed_tabs.length - msg.count];

      if (last_closed_tab) {
        Tab.closed_tabs.splice(index,1);
        chrome.tabs.create({url: last_closed_tab.url, index: last_closed_tab.index});
      }
    }
  }

  function goto(msg) {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      var index = null;

      if (typeof msg.index != 'undefined') {
        index = Math.min(msg.index, tabs.length-1);
      }

      if (typeof msg.offset != 'undefined') {
        index = tab.index + msg.offset;
        index = index % tabs.length;
      }
      if (index < 0) { index = index + tabs.length; }

      tab = tabs[index] || tab;
      chrome.tabs.update(tab.id, {selected: true});
    });
  }

  function selectPrevious() {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      chrome.tabs.update(Tab.last_selected_tab.id, {selected: true});
    });
  }

  function selectLastOpen(msg) {
    var index = Tab.last_open_tabs.length - msg.count;
    var tab = Tab.last_open_tabs[index]
    update({active: true}, tab)
  }

  function reloadAll(msg) {
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      for (var i=0; i < tabs.length; i++) {
        var tab = tabs[i];
        chrome.tabs.update(tab.id, {url: tab.url, selected: tab.selected}, null);
      }
    });
  }

  function reloadWithoutCache(msg) {
    var tab = arguments[arguments.length-1];

    chrome.tabs.reload(tab.id, {bypassCache: true});
  }

  function openUrl(msg) {
    var tab       = arguments[arguments.length-1];
    var urls      = msg.urls || msg.url;
    if (typeof urls == 'string') { urls = [urls]; }

    var first_url = urls.shift();
    var index     = tab.index;

    if (msg.newtab) {
      chrome.tabs.create({ url: first_url, index: ++index});
    } else {
      chrome.tabs.update(tab.id, {url: first_url});
    }
    for (var i = 0;i < urls.length;i++) {
      chrome.tabs.create({ url: urls[i], index: ++index, selected: false});
    }
  }

  function openFromClipboard(msg) {
    url = Clipboard.read();

    // Refact me
    if ( /\./.test(url) && !/\s/.test(url)) {
      url = (url.match("://") ? "" : "http://") + url;
    } else if (!url.match(/:\/\//)) {
      url = Option.default_search_url(url)
    }

    msg.url = url
    openUrl(msg, arguments[arguments.length-1]);
  }

  function togglePin() {
    var tab = arguments[arguments.length-1];
    update({pinned: !tab.pinned}, tab);
  }

  function duplicate(msg) {
    var tab = arguments[arguments.length-1];

    for (var i = 0; i < msg.count; i++) {
      chrome.tabs.create({ url: tab.url, index: ++tab.index, selected: false});
    }
  }

  function detach() {
    var tab = arguments[arguments.length-1];
    chrome.windows.create({ tabId: tab.id, incognito: tab.incognito});
  }

  function openInIncognito() {
    var tab       = arguments[arguments.length-1];
    var incognito = !tab.incognito;

    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      if (tabs.length == 1) {
        duplicate({count: 1}, tab);
        Window.moveTabToWindowWithIncognito(tab, incognito, /* create_mode */ true,
                                            function(tab) { chrome.windows.remove(tab.windowId); }
                                           );
      } else {
        Window.moveTabToWindowWithIncognito(tab, incognito, /* create_mode */ true,
                                            function(tab) { chrome.tabs.remove(tab.id); }
                                           );
      }
    });
  }

  function merge() {
    var tab = arguments[arguments.length-1];
    Window.moveTabToWindowWithIncognito(tab, tab.incognito);
  }

  function mergeAll() {
    var tab = arguments[arguments.length-1];
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      for (var i=tabs.length-1; i >= 0; i--) {
        Window.moveTabToWindowWithIncognito(tabs[i], tabs[i].incognito);
      }
    });
  }

  return {
    update         : update,
    close          : close,
    reopen         : reopen,
    goto           : goto,
    selectPrevious : selectPrevious,
    selectLastOpen : selectLastOpen,
    reloadWithoutCache: reloadWithoutCache,
    reloadAll      : reloadAll,
    openUrl        : openUrl,
    openFromClipboard : openFromClipboard,
    togglePin         : togglePin,
    duplicate         : duplicate,
    detach            : detach,
    openInIncognito   : openInIncognito,
    merge             : merge,
    mergeAll          : mergeAll,
    autoComplete : autoComplete
  };
})();

// Tab.closed_tabs, now_tab, last_selected_tab, current_closed_tab;
Tab.closed_tabs = [];
Tab.last_open_tabs = [];
