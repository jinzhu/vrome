# Auto Reload Extension
latestVersion = null
time = 500

reload = ->
  chrome.tabs.reload bypassCache: true
  chrome.tabs.query url: "chrome://extensions-frame/", (tabs) ->
    if tab = tabs[0]
      chrome.tabs.reload tab.id, bypassCache: true
    else
      chrome.tabs.create url: "chrome://extensions-frame/", selected: false, pinned: true
      reload()

reloadExtension = ->
  $.post('http://127.0.0.1:20000', JSON.stringify({'method': 'get_latest_version'}))
    .done (response) ->
      if (latestVersion isnt null) && (latestVersion isnt response)
        reload()

      latestVersion = response

root = exports ? window
root.reloadExtension = reloadExtension

setInterval reloadExtension, time
