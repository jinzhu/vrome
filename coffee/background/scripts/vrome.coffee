class Vrome
  disableMap = {}

  @setStatus: ->
    chrome.tabs.getSelected null, (tab) ->
      if disableMap[tab.id]
        chrome.browserAction.setIcon path: 'images/logo-disable.png'
        chrome.browserAction.setTitle title: 'Vrome (disabled)'
      else
        chrome.browserAction.setIcon path: 'images/logo.png'
        chrome.browserAction.setTitle title:"Vrome (enabled)"

  @enable: (msg) =>
    disableMap[msg.tab.id] = false
    @setStatus()

  @disable: (msg) =>
    disableMap[msg.tab.id] = true
    @setStatus()


root = exports ? window
root.Vrome = Vrome
