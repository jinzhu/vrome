window.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

window.isEditableElement = (element) ->
  element.nodeType is 1 and
    ($(element).is('input, textarea, select') or
      element.getAttribute('contenteditable')?)

Settings.init ->
  do KeyEvent.init
  $ ->
    func.call() for func in [Zoom.init, Custom.runJS, Custom.loadCSS]
    return
