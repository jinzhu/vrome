# Auto Reload Extension
latestVersion = null
time = 500

root = exports ? window

root.reloadExtension = ->
  chrome.tabs.query url: 'chrome://extensions-frame/', (tabs) ->
    if tab = tabs[0]
      chrome.tabs.reload tab.id, bypassCache: true
    else
      chrome.tabs.create url: 'chrome://extensions-frame/', active: false, pinned: true
      reloadExtension()

root.checkReloadExtension = ->
  $.post('http://127.0.0.1:20000', JSON.stringify({'method': 'get_latest_version'})).success (response) ->
    if latestVersion isnt null and latestVersion isnt response
      reloadExtension()

    if latestVersion is null
      chrome.tabs.reload bypassCache: true

    latestVersion = response

setInterval checkReloadExtension, time
