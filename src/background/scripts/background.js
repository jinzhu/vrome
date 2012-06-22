Vromerc.loadAll( /*scheduleNextReload*/ true);

function syncSettingAllTabs() {
  chrome.windows.getAll({
    populate: true
  }, function(windows) {
    _.each(windows, function(w) {
      _.each(w.tabs, function(tab) {
        syncSetting(tab)
      })
    })
  })
}

function syncSetting(tab) {
  Vromerc.loadLocal();
  if (!tab) {
    return false;
  }

  if (tab != Tab.now_tab) {
    Tab.last_selected_tab = Tab.now_tab || tab;
    Tab.now_tab = tab;
  }

  Settings.add({
    currentUrl: tab.url,
    now_tab_id: Tab.now_tab.id
  });

  Settings.syncTabStorage(tab)

  return true
}

chrome.tabs.onCreated.addListener(function(tab) {
  chrome.tabs.get(tab.id, function(tab) {
    syncSetting(tab);
    Tab.last_open_tabs.push(tab);
  });
});

chrome.tabs.onUpdated.addListener(function(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    syncSetting(tab);
  });
});

chrome.tabs.onActiveChanged.addListener(function(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    syncSetting(tab);
  });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  var tab = Tab.current_closed_tab || Tab.now_tab;
  if (tab) {
    Tab.closed_tabs.push(tab);
  };
  Tab.current_closed_tab = false;
});

// when clicking a link, open tab on the right
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.openerTabId && Option.get('open_tab_on_the_right')) {
    chrome.tabs.get(tab.openerTabId, function(srcTab) {
      chrome.tabs.move(tab.id, {
        index: srcTab.index + 1
      })
    })
  }
});
