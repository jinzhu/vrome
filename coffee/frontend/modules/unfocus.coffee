# TODO: doesn't work for Gmail when the reply text field is open
# TODO: doesn't work for http://3v4l.org/XXbtf
# TODO: doesn't work for http://msdn.microsoft.com/en-us/magazine/default.aspx
# TODO: doesn't work for http://grooveshark.com/

# sites to test with:
# https://encrypted.google.com/
# http://pagemon.net/
# https://imo.im/register
# http://www.edreams.com/
# http://mailinator.com/
# http://zamunda.net/login.php
# http://www.twoo.com/

class window.Unfocus
  disabledElements = []
  observer = null

  onFocus = (e) ->
    e.target.blur() if Option.get('disable_autofocus')

  addOnFocus = (element) ->
    if isEditableElement element
      element.addEventListener 'focus', onFocus, false
      disabledElements.push element
    addOnFocus child for child in element.children
    return

  removeOnFocus = ->
    element.removeEventListener 'focus', onFocus, false for element in disabledElements
    disabledElements = []

  onClick = (e) =>
    do @didReceiveInput
    do e.target.focus

  @didReceiveInput: ->
    return if disabledElements.length is 0

    do observer.disconnect
    $(document.documentElement).off 'click', onClick
    do removeOnFocus

  $(document.documentElement).click(onClick).focus()

  observer = new WebKitMutationObserver (mutations) ->
    for mutation in mutations
      for addedNode in mutation.addedNodes when addedNode.nodeType is 1
        addOnFocus addedNode
    return
  observer.observe document.documentElement, childList: true, subtree: true

  addOnFocus document.documentElement
