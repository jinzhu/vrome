root = exports ? window

root.Post = (msg) ->
  chrome.extension.sendMessage msg, (response) ->

addErrorLogger = ->
  window.addEventListener "error", ((err) ->
    Debug err
  ), false

try
  runIt Settings.init, -> func.call() for func in [Zoom.init, KeyEvent.init, Custom.runJS, Custom.loadCSS]
  runIt addErrorLogger
catch err
  Debug err
