root = exports ? window

root.Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message, ->

root.runScript = (msg) ->
  chrome.tabs.executeScript msg.tab.id, code: msg.code

# Notify new version
root.checkNewVersion = ->
  $.get(chrome.extension.getURL 'manifest.json').done (data) ->
    data = JSON.parse data
    openOptions 'changelog' if Settings.get('version') isnt data.version
    Settings.add version: data.version

root.openChromeStore = -> openOrSelectUrl 'https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details'
root.openIssuesPage  = -> openOrSelectUrl 'https://github.com/jinzhu/vrome/issues'
root.openSourcePage  = -> openOrSelectUrl 'https://github.com/jinzhu/vrome'
root.openOptions = (params) ->
  url = "background/options.html#{if params then "##{params}" else ''}"
  openOrSelectUrl chrome.extension.getURL(url)

openOrSelectUrl = (url) ->
  msg = url: url, newTab: true, active: true

  chrome.tabs.query url: msg.url, (tabs) ->
    return chrome.tabs.update tabs[0].id, active: true if tabs.length > 0
    chrome.tabs.query active: true, (tabs) ->
      msg.tab = tabs[0]
      Tab.openUrl msg

window.addEventListener 'error', ((err) -> Debug err), false

Settings.init checkNewVersion
