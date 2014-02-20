window.Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message

window.runScript = (msg) ->
  chrome.tabs.executeScript msg.tab.id, code: msg.code

window.addEventListener 'error', ((error) -> Debug error), false

# notify of new version
checkNewVersion = ->
  $.get(chrome.extension.getURL 'manifest.json').done (data) ->
    data = JSON.parse data
    openOptions 'changelog' if Settings.get('version') isnt data.version
    Settings.add version: data.version

Settings.init ->
  do checkNewVersion
  do Vromerc.init
  do Develop.init
