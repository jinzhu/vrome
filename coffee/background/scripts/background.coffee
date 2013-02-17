syncSettingAllTabs = ->
  chrome.windows.getAll {populate: true}, (windows) ->
    for window in windows
      for tab in window.tabs
        syncSetting tab


syncSetting = (tab) ->
  Vromerc.loadLocal()
  return false unless tab
  if tab isnt Tab.now_tab
    Tab.lastTab = Tab.now_tab
    Tab.now_tab = tab


chrome.tabs.onCreated.addListener (tab) ->
  syncSetting tab
  Tab.last_open_tabs.push tab

  # when clicking a link, open tab on the right
  if tab.openerTabId and Option.get("open_tab_on_the_right")
    chrome.tabs.get tab.openerTabId, (srcTab) ->
      chrome.tabs.move tab.id, index: srcTab.index + 1


chrome.tabs.onUpdated.addListener (tabId) ->
  chrome.tabs.get tabId, (tab) -> syncSetting tab


chrome.tabs.onActivated.addListener (info) ->
  chrome.tabs.get info.tabId, (tab) ->
    syncSetting tab if tab


chrome.tabs.onRemoved.addListener (tabId) ->
  tab = Tab.now_tab
  Tab.addToClosedTabs tab if tab?.id == tabId

$ ->
  Vromerc.init()

root = exports ? window
root.syncSettingAllTabs = syncSettingAllTabs
