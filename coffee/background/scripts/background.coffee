# chrome.tabs.onUpdated.addListener (tabId) ->

chrome.tabs.onCreated.addListener (tab) ->
  Tab.lastOpenTabs.push tab

chrome.tabs.onActivated.addListener (info) ->
  chrome.tabs.get info.tabId, (tab) ->
    if tab and (tab isnt Tab.now_tab)
      Tab.lastTab = Tab.now_tab
      Tab.now_tab = tab

  Vrome.setStatus()

chrome.tabs.onRemoved.addListener (tabId) ->
  tab = Tab.now_tab
  Tab.addToClosedTabs tab if tab?.id == tabId

$ ->
  Vromerc.init()

root = exports ? window
