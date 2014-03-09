# TODO: this doesn't work for 'autofocus' attributes (e.g. mailinator.com)
# TODO: this doesn't work for Gmail when the reply text field is open

class window.Unfocus
  disabledElements = []

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

  onDOMNodeInserted = (event) ->
    element = event.target
    if element.nodeType is 1 and element.id isnt CmdBox.INPUT_BOX_ID
      addOnFocus event.target

  document.addEventListener 'DOMContentLoaded', ->
    addOnFocus document.documentElement

    document.addEventListener 'DOMNodeInserted', onDOMNodeInserted

  @didReceiveInput: =>
    document.removeEventListener 'DOMNodeInserted', onDOMNodeInserted
    $(document.documentElement).off 'click', @didReceiveInput
    do removeOnFocus

  $(document.documentElement).click(@didReceiveInput).focus()
