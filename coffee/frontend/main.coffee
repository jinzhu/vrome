window.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

Settings.init ->
  do KeyEvent.init
  $ ->
    window.$body = $('body')
    func.call() for func in [Search.init, Mouse.init, Zoom.init, Custom.runJS, Custom.loadCSS]
    return
