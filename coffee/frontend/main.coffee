root = exports ? window

root.Post = (msg) ->
  chrome.runtime.sendMessage msg, (response) ->

window.addEventListener "error", ((err) -> Debug err), false

try
  Settings.init ->
    do KeyEvent.init
    $ ->
      func.call() for func in [Zoom.init, Custom.runJS, Custom.loadCSS]
      return
catch err
  Debug err
