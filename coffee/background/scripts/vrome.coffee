class Vrome
  disableMap = {}

  @setStatus: (tabId) ->
    if disableMap[tabId]?
      chrome.browserAction.setIcon  path:  'images/logo-disable.png'
      chrome.browserAction.setTitle title: 'Vrome (disabled)'
    else
      chrome.browserAction.setIcon  path:  'images/logo.png'
      chrome.browserAction.setTitle title: 'Vrome (enabled)'

  @enable: (msg) =>
    delete disableMap[msg.tab.id]
    @setStatus msg.tab.id

  @disable: (msg) =>
    disableMap[msg.tab.id] = true
    @setStatus msg.tab.id

root = exports ? window
root.Vrome = Vrome
