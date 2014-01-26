root = exports ? window

root.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

Settings.init ->
  do KeyEvent.init
  $ ->
    root.$body = $('body')
    func.call() for func in [Mouse.init, Zoom.init, Custom.runJS, Custom.loadCSS]
    return
