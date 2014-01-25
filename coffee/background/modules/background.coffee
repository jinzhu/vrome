chrome.tabs.onCreated.addListener (tab) ->
  Tab.lastOpenTabs.push tab

chrome.tabs.onActivated.addListener (info) ->
  if not Tab.currentTab or info.tabId isnt Tab.currentTab.id
    chrome.tabs.get info.tabId, (tab) ->
      if tab
        Tab.previousTab = Tab.currentTab
        Tab.currentTab = tab

  Vrome.setStatus info.tabId

chrome.tabs.onRemoved.addListener (tabId) ->
  tab = Tab.currentTab
  Tab.addToClosedTabs tab if tab?.id is tabId
