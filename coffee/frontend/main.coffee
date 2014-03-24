window.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

window.getClickedElement = (e) ->
  document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset)

Settings.init ->
  do KeyEvent.init
  $ ->
    func.call() for func in [Zoom.init, Custom.runJS, Custom.loadCSS]
    return
