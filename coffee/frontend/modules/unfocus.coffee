# TODO: doesn't work for Gmail when the reply text field is open
# TODO: doesn't work for http://3v4l.org/XXbtf
# TODO: doesn't work for http://www.twoo.com/

# sites to test with:
# https://encrypted.google.com/
# http://pagemon.net/
# https://imo.im/register
# http://www.edreams.com/
# http://mailinator.com/

class window.Unfocus
  disabledElements = []
  observer = null

  onFocus = (e) ->
    element = e.target
    # In Chrome, caller is null if the user initiated the focus
    # or the element has the 'autofocus' attribute,
    # and non-null if the focus was caused by a call to element.focus().
    nonUserInitiated = onFocus.caller or element.autofocus
    element.blur() if Option.get('disable_autofocus') and nonUserInitiated

  addOnFocus = (element) ->
    if isEditableElement element
      element.addEventListener 'focus', onFocus, false
      disabledElements.push element
    addOnFocus child for child in element.children
    return

  removeOnFocus = ->
    element.removeEventListener 'focus', onFocus, false for element in disabledElements
    disabledElements = []

  @didReceiveInput: =>
    do observer.disconnect
    $(document.documentElement).off 'click', @didReceiveInput
    do removeOnFocus

  $(document.documentElement).click(@didReceiveInput).focus()

  observer = new WebKitMutationObserver (mutations) ->
    for mutation in mutations
      for addedNode in mutation.addedNodes when addedNode.nodeType is 1
        addOnFocus addedNode
    return
  observer.observe document.documentElement, childList: true, subtree: true

  addOnFocus document.documentElement
