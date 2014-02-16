window.Post = chrome.runtime.sendMessage

window.addEventListener 'error', ((error) -> Debug error), false

window.isEditableElement = (element) ->
  element.nodeType is 1 and
    (element.nodeName in ['INPUT', 'TEXTAREA', 'SELECT'] or
      element.getAttribute('contenteditable')?)

Settings.init ->
  do KeyEvent.init
  $ ->
    window.$body = $('body')
    func.call() for func in [Zoom.init, Custom.runJS, Custom.loadCSS]
    return
