window.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

Settings.init ->
  do KeyEvent.init
  $ ->
    func.call() for func in [Zoom.init, Custom.runJS, Custom.loadCSS]
    return
