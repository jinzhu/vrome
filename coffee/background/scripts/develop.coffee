# Auto Reload Extension
latestVersion = null
time = 500

reloadExtension = ->
  chrome.tabs.query url: "chrome://extensions-frame/", (tabs) ->
    if tab = tabs[0]
      chrome.tabs.reload tab.id, bypassCache: true
    else
      chrome.tabs.create url: "chrome://extensions-frame/", active: false, pinned: true
      reloadExtension()

checkReloadExtension = ->
  $.post('http://127.0.0.1:20000', JSON.stringify({'method': 'get_latest_version'})).success (response) ->
    if (latestVersion isnt null) && (latestVersion isnt response)
      reloadExtension()

    if latestVersion is null
      chrome.tabs.reload bypassCache: true

    latestVersion = response

root = exports ? window
root.reloadExtension = reloadExtension
root.checkReloadExtension = checkReloadExtension

setInterval checkReloadExtension, time
