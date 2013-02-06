# Auto Reload Extension
latestVersion = null
time = 500

reloadExtension = ->
  $.post('http://127.0.0.1:20000', JSON.stringify({'method': 'get_latest_version'}))
    .done (response) ->
      if (latestVersion isnt null) && (latestVersion isnt response)
        location.reload()
        chrome.tabs.reload()
      else
        latestVersion = response

root = exports ? window
root.reloadExtension = reloadExtension

setInterval reloadExtension, time
