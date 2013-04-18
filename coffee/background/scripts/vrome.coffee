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

  @enable: =>
    disableMap[getTab(arguments).id] = false
    @setStatus()

  @disable: =>
    disableMap[getTab(arguments).id] = true
    @setStatus()


root = exports ? window
root.Vrome = Vrome
