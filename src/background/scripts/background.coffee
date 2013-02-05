#scheduleNextReload
syncSettingAllTabs = ->
  chrome.windows.getAll
    populate: true
  , (windows) ->
    _.each windows, (w) ->
      _.each w.tabs, (tab) ->
        syncSetting tab



syncSetting = (tab) ->
  Vromerc.loadLocal()
  return false  unless tab
  Tab.now_tab = tab  unless tab is Tab.now_tab
  Settings.add
    currentUrl: tab.url
    now_tab_id: Tab.now_tab.id

  Settings.syncTabStorage tab
  true
Vromerc.loadAll true
chrome.tabs.onCreated.addListener (tab) ->
  chrome.tabs.get tab.id, (tab) ->
    syncSetting tab
    Tab.last_open_tabs.push tab

  
  # when clicking a link, open tab on the right
  if tab.openerTabId and Option.get("open_tab_on_the_right")
    chrome.tabs.get tab.openerTabId, (srcTab) ->
      chrome.tabs.move tab.id,
        index: srcTab.index + 1



chrome.tabs.onUpdated.addListener (tabId) ->
  chrome.tabs.get tabId, (tab) ->
    syncSetting tab


chrome.tabs.onActivated.addListener (info) ->
  chrome.tabs.get info.tabId, (tab) ->
    syncSetting tab
    
    # switch last active
    try
      if tab and tab.windowId and Tab.activeTabs[tab.windowId]
        Tab.activeTabs[tab.windowId]["last_tab_id"] = Tab.activeTabs[tab.windowId]["current_tab_id"]
        Tab.activeTabs[tab.windowId]["current_tab_id"] = tab.id
    catch err
      logError err


chrome.tabs.onRemoved.addListener (tabId) ->
  tab = Tab.current_closed_tab or Tab.now_tab
  Tab.closed_tabs.push tab  if tab
  Tab.current_closed_tab = false


# initialize active tabs from all windows
Tab.initializeCurrentTabs()
