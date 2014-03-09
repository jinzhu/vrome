# TODO: this doesn't work for 'autofocus' attributes (e.g. mailinator.com)
# TODO: this doesn't work for Gmail when the reply text field is open

# sites to test with:
# https://encrypted.google.com/
# http://pagemon.net/
# https://imo.im/register
# http://www.edreams.com/

class window.Unfocus
  disabledElements = []
  observer = null

  onFocus = (e) ->
    # In Chrome, caller is null if the user initiated the focus,
    # and non-null if the focus was caused by a call to element.focus().
    e.target.blur() if Option.get('disable_autofocus') and onFocus.caller

  addOnFocus = (element) ->
    if isEditableElement element
      element.addEventListener 'focus', onFocus, false
      disabledElements.push element
    addOnFocus child for child in element.children
    return

  removeOnFocus = ->
    element.removeEventListener 'focus', onFocus, false for element in disabledElements
    disabledElements = []

  document.addEventListener 'DOMContentLoaded', ->
    addOnFocus document.documentElement

    observer = new WebKitMutationObserver (mutations) ->
      for mutation in mutations
        for addedNode in mutation.addedNodes when addedNode.nodeType is 1
          addOnFocus addedNode
      return
    observer.observe document.body, childList: true, subtree: true

  @didReceiveInput: =>
    do observer.disconnect
    $(document.documentElement).off 'click', @didReceiveInput
    do removeOnFocus

  $(document.documentElement).click(@didReceiveInput).focus()
