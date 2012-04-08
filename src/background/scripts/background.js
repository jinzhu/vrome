Vromerc.loadAll( /*scheduleNextReload*/ true);

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

  Post(tab, {
    action: "Settings.add",
    arguments: {
      background: Settings.get()
    }
  });
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
