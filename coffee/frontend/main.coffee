root = exports ? window

root.Post = (msg) ->
  chrome.runtime.sendMessage msg, ->

window.addEventListener 'error', ((err) -> Debug err), false

Settings.init ->
  do KeyEvent.init
  $ ->
    root.$body = $('body')
    func.call() for func in [Mouse.init, Zoom.init, Custom.runJS, Custom.loadCSS]
    return
