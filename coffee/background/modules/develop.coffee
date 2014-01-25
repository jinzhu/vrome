# Auto Reload Extension
latestVersion = null
TIME = 500

root = exports ? window

root.reloadExtension = ->
  chrome.tabs.query url: 'chrome://extensions-frame/', currentWindow: true, (tabs) ->
    if tabs.length > 0
      chrome.tabs.reload tabs[0].id, bypassCache: true
    else
      chrome.tabs.create url: 'chrome://extensions-frame/', active: false, pinned: true

checkReloadExtension = ->
  $.post(getLocalServerUrl(), JSON.stringify(method: 'get_latest_version')).success (response) ->
    if latestVersion isnt null and latestVersion isnt response
      reloadExtension()

    if latestVersion is null
      chrome.tabs.reload bypassCache: true

    latestVersion = response

setInterval checkReloadExtension, TIME
