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
    var tab = arguments[arguments.length - 1];
    var keyword = msg.keyword;
    var return_urls = [];

    if (msg.default_urls) {
      var default_url = {};
      default_url.url = msg.default_urls;
      return_urls.push(default_url);
    }

    if (Option.get('noautocomplete')) {
      Post(tab, {
        action: "Dialog.draw",
        urls: return_urls,
        keyword: keyword
      });
    } else {
      chrome.bookmarks.search(keyword, function(bookmarks) {
        // Search start from 10 days ago
        chrome.history.search({
          text: keyword,
          maxResults: 30,
          startTime: (new Date().getTime() - 1000 * 60 * 60 * 24 * 10)
        }, function(historys) {
          Post(tab, {
            action: "Dialog.draw",
            urls: return_urls.concat(bookmarks.concat(historys)),
            keyword: keyword
          });
        });
      });
    }
  }

  function update(msg) {
    var tab = arguments[arguments.length - 1];
    var attr = {};

    if (typeof msg.url !== "undefined") {
      attr.url = msg.url;
    }
    if (typeof msg.active !== "undefined") {
      attr.active = msg.active;
    }
    if (typeof msg.highlighted !== "undefined") {
      attr.highlighted = msg.highlighted;
    }
    if (typeof msg.pinned !== "undefined") {
      attr.pinned = msg.pinned;
    }

    chrome.tabs.update(tab.id, attr, function(new_tab) {
      if (msg.callback) {
        runWhenComplete(new_tab.id, {
          code: msg.callback
        });
      }
    });
  }

  function move(msg) {
    var tab = arguments[arguments.length - 1];
    var times = msg.count
    chrome.tabs.query({
      windowId: tab.windowId
    }, function(tabs) {
      if (tabs.length === 1) return;

      var direction = msg.direction === "left" ? -1 : 1;
      var newIndex = (tab.index + times * direction)

      if (newIndex < 0 || newIndex >= tabs.length) newIndex = newIndex + tabs.length * (direction * -1);

      chrome.tabs.move(tab.id, {
        index: newIndex
      });
    })
  }

  function close(msg) {
    var tab = arguments[arguments.length - 1];
    Tab.current_closed_tab = tab;

    if (msg.count == 1) {
      delete msg.count;
    }

    // eval code no longer supported in chrome 20
    var closeMap = {
      closeOther: 'v.id != tab.id && !v.pinned',
      closeLeft: 'v.index < tab.index && !v.pinned',
      closeRight: 'v.index > tab.index && !v.pinned',
      closePinned: 'v.pinned',
      closeUnPinned: '!v.pinned',
      otherWindows: 'v.windowId != tab.windowId && !v.pinned',
      count: 'v.index >= tab.index'
    }

    // TODO: refactor code in frontend to use a string i.e type: 'closeOther' instead of closeOther being a key
    var cond = _.chain(_.intersect(_.keys(msg), _.keys(closeMap))).first().value()

    if (cond || msg.count > 1) {
      chrome.windows.getAll({
        populate: true
      }, function(windows) {
        if (!msg.otherWindows) {
          windows = _.filter(windows, function(w) {
            return w.id === tab.windowId;
          })
        }
        _.each(windows, function(w) {
          var tabs = w.tabs
          tabs = _.filter(tabs, function(v) {
            var ret = false
            switch (cond) {
            case 'closeOther':
              ret = v.id == tab.id || v.pinned
              break
            case 'closeLeft':
              ret = v.id == tab.id || v.pinned || tab.index < v.index
              break
            case 'closeRight':
              ret = v.id == tab.id || v.pinned || tab.index > v.index
              break
            case 'closePinned':
              ret = !v.pinned
              break
            case 'closeUnPinned':
              ret = v.pinned
              break
            case 'otherWindows':
              ret = v.windowId == tab.windowId || v.pinned
              break
            }
            return !ret
          })
          _.each(tabs, function(v, k) {
            if (msg.count && k > msg.count) return;
            chrome.tabs.remove(v.id)
          })
        })
      })
    } else {
      chrome.tabs.remove(tab.id);
      if (msg.focusLast) {
        selectPrevious.apply('', arguments);
      } // close and select right
      if (msg.offset) {
        select.apply('', arguments);
      } // close and select left
    }
  }

  function reopen(msg) {
    if (Tab.closed_tabs.length > 0) {
      var index = Tab.closed_tabs.length - msg.count;
      var last_closed_tab = Tab.closed_tabs[Tab.closed_tabs.length - msg.count];

      if (last_closed_tab) {
        Tab.closed_tabs.splice(index, 1);
        chrome.tabs.create({
          url: last_closed_tab.url,
          index: last_closed_tab.index
        });
      }
    }
  }

  function select(msg) {
    var tab = arguments[arguments.length - 1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      var index = null;

      if (typeof msg.index != 'undefined') {
        index = Math.min(msg.index, tabs.length - 1);
      }

      if (typeof msg.offset != 'undefined') {
        index = tab.index + msg.offset;
        index = index % tabs.length;
      }
      if (index < 0) {
        index = index + tabs.length;
      }

      tab = tabs[index] || tab;
      chrome.tabs.update(tab.id, {
        selected: true
      });
    });
  }

  function selectPrevious() {
    var tab = arguments[arguments.length - 1];
    chrome.tabs.update(Tab.activeTabs[tab.windowId]['last_tab_id'], {
      selected: true
    });
  }

  function selectLastOpen(msg) {
    var index = Tab.last_open_tabs.length - msg.count;
    var tab = Tab.last_open_tabs[index]
    update({
      active: true
    }, tab)
  }

  function filterUnpinnedTabs(tabs) {
    // only returns unpinned tabs
    // This way we don't reload, close or affect tabs that are pinned -- like chrome behaves
    return _.filter(tabs, function(tab) {
      return !tab.pinned;
    })
  }

  function reloadAll(msg) {
    var tab = arguments[arguments.length - 1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      _.each(filterUnpinnedTabs(tabs), function(tab) {
        chrome.tabs.update(tab.id, {
          url: tab.url,
          selected: tab.selected
        }, null);
      })
    });
  }

  function reloadWithoutCache(msg) {
    var tab = arguments[arguments.length - 1];

    chrome.tabs.reload(tab.id, {
      bypassCache: true
    });
  }

  function openUrl(msg) {
    var tab = arguments[arguments.length - 1];
    var urls = msg.urls || msg.url;
    if (typeof urls == 'string') {
      urls = [urls];
    }

    var first_url = urls.shift();
    var index = tab.index;

    if (msg.newtab) {
      chrome.tabs.create({
        url: first_url,
        index: ++index,
        selected: false
      });
    } else {
      chrome.tabs.update(tab.id, {
        url: first_url
      });
    }
    for (var i = 0; i < urls.length; i++) {
      chrome.tabs.create({
        url: urls[i],
        index: ++index,
        selected: false
      });
    }
  }

  function openFromClipboard(msg) {
    var url = Clipboard.read();

    if (!url.isValidURL()) {
      url = Option.default_search_url(url)
    }

    msg.url = url
    openUrl(msg, arguments[arguments.length - 1]);
  }

  function unpinAll(msg) {
    var tab = arguments[arguments.length - 1];

    chrome.windows.getAll({
      populate: true
    }, function(windows) {
      if (!msg.allWindows) {
        windows = _.filter(windows, function(w) {
          return w.id === tab.windowId
        })
      }
      _.each(windows, function(w) {
        var tabs = _.filter(w.tabs, function(v) {
          return v.pinned;
        })

        // no unpinned, then pin all of them
        var pinned = false
        if (tabs.length === 0) {
          tabs = w.tabs
          pinned = true
        }

        _.each(tabs, function(t) {
          update({
            pinned: pinned
          }, t)
        })
      })
    })
  }

  function togglePin() {
    var tab = arguments[arguments.length - 1];
    update({
      pinned: !tab.pinned
    }, tab);
  }

  function duplicate(msg) {
    var tab = arguments[arguments.length - 1];

    for (var i = 0; i < msg.count; i++) {
      chrome.tabs.create({
        url: tab.url,
        index: ++tab.index,
        selected: false
      });
    }
  }

  function detach() {
    var tab = arguments[arguments.length - 1];
    chrome.windows.create({
      tabId: tab.id,
      incognito: tab.incognito
    });
  }

  function makeLastTabIncognito() {
    var tab = Tab.last_open_tabs[Tab.last_open_tabs.length - 1]
    if (tab) {
      openInIncognito(tab)
    }
  }

  function openInIncognito() {
    var tab = arguments[arguments.length - 1];
    var incognito = !tab.incognito;

    chrome.tabs.query({
      windowId: tab.windowId
    }, function(tabs) {
      if (tabs.length == 1) {
        duplicate({
          count: 1
        }, tab);
        Window.moveTabToWindowWithIncognito(tab, incognito, /* create_mode */ true, function(tab) {
          chrome.windows.remove(tab.windowId);
        });
      } else {
        Window.moveTabToWindowWithIncognito(tab, incognito, /* create_mode */ true, function(tab) {
          chrome.tabs.remove(tab.id);
        });
      }
    });
  }

  /*
   * adds tab ids to a list of tabs waiting to be merged in a new window
   */

  function markForMerging(msg) {
    var tab = arguments[arguments.length - 1];

    // add tab or all tabs in window as marked_tabs
    chrome.tabs.query({
      windowId: tab.windowId
    }, function(tabs) {
      tabs = _.filter(tabs, function(v) {
        return !v.pinned;
      })

      // limit to current tab
      if (!msg.all) {
        tabs = [tab]
      }

      var title = ''
      _.each(tabs, function(v) {
        Tab.marked_tabs = _.uniq(Tab.marked_tabs)

        // toggle marked/unmarked
        var posi = _.indexOf(Tab.marked_tabs, v.id)

        if (posi === -1) {

          // mark it
          Tab.marked_tabs.push(v.id)
          title = Tab.marked_tabs.length + ' Tab(s) marked '
        } else {
          // unmark it
          delete Tab.marked_tabs[posi]

          // remove null entries
          Tab.marked_tabs = _.select(Tab.marked_tabs, function(vid) {
            return vid != null
          })

          title = tabs.length + " Tab(s) unmarked"
          if (Tab.marked_tabs.length) title += " -- " + Tab.marked_tabs.length + " Tab(s) still marked"
        }
      })

      Post(tab, {
        action: "CmdBox.set",
        title: title,
        timeout: 4000
      })
    })
  }

  function putMarkedTabs() {
    var tab = arguments[arguments.length - 1];

    if (Tab.marked_tabs.length > 0) {

      chrome.tabs.move(Tab.marked_tabs, {
        windowId: tab.windowId,
        index: tab.index + 1
      }, function(tmp) {
        Post(tab, {
          action: "CmdBox.set",
          title: tmp.length + ' Tab(s) moved',
          timeout: 4000
        })
        Tab.marked_tabs = []
      })
    }
  }

  /**
   * creates a data structure with
   * window_id:
   *   last_tab_id
   *   current_tab_id
   *
   * data structure is used to switch between tabs through various windows
   */

  function initializeCurrentTabs() {
    chrome.windows.getAll({
      populate: true
    }, function(windows) {
      _.each(windows, function(w) {
        _.each(w.tabs, function(tab) {
          if (tab.active) {
            Tab.activeTabs[w.id] = {
              'last_tab_id': tab.id,
              'current_tab_id': tab.id
            }
          }
        })
      })
    })

  }

  /**
   * @deprecated using markForMerging instead
   */

  function merge() {
    var tab = arguments[arguments.length - 1];
    Window.moveTabToWindowWithIncognito(tab, tab.incognito);
  }

  /**
   * @deprecated using markForMerging instead
   */

  function mergeAll() {
    var tab = arguments[arguments.length - 1];
    chrome.tabs.query({
      windowId: tab.windowId
    }, function(tabs) {
      for (var i = tabs.length - 1; i >= 0; i--) {
        Window.moveTabToWindowWithIncognito(tabs[i], tabs[i].incognito);
      }
    });
  }

  return {
    update: update,
    close: close,
    move: move,
    reopen: reopen,
    select: select,
    selectPrevious: selectPrevious,
    selectLastOpen: selectLastOpen,
    reloadWithoutCache: reloadWithoutCache,
    reloadAll: reloadAll,
    openUrl: openUrl,
    openFromClipboard: openFromClipboard,
    togglePin: togglePin,
    unpinAll: unpinAll,
    duplicate: duplicate,
    detach: detach,
    openInIncognito: openInIncognito,
    merge: merge,
    mergeAll: mergeAll,
    autoComplete: autoComplete,
    markForMerging: markForMerging,
    putMarkedTabs: putMarkedTabs,
    initializeCurrentTabs: initializeCurrentTabs,
    makeLastTabIncognito: makeLastTabIncognito
  };
})();

// Tab.closed_tabs, now_tab, last_selected_tab, current_closed_tab;
Tab.closed_tabs = [];
Tab.last_open_tabs = [];
Tab.marked_tabs = [];
Tab.activeTabs = {};
