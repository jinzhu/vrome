# TODO: this doesn't work for 'autofocus' attributes

onFocus = (e) ->
  # In Chrome, caller is null if the user initiated the focus,
  # and non-null if the focus was caused by a call to element.focus().
  e.target.blur() if Option.get('disable_autofocus') and onFocus.caller

removeOnFocus = (element) ->
  element.removeEventListener 'focus', onFocus, false
  removeOnFocus child for child in element.children
  return

onInsertedIntoDocument = (e) ->
  element = e.target
  element.addEventListener 'focus', onFocus, false if element.nodeType is 1

onRemovedFromDocument = (e) ->
  element = e.target
  removeOnFocus element if element.nodeType is 1

document.addEventListener 'DOMNodeInsertedIntoDocument', onInsertedIntoDocument, true
document.addEventListener 'DOMNodeRemovedFromDocument', onRemovedFromDocument, true
window.addEventListener('load', (e) ->
  setTimeout(->
    document.removeEventListener 'DOMNodeInsertedIntoDocument', onInsertedIntoDocument, true
    document.removeEventListener 'DOMNodeRemovedFromDocument', onRemovedFromDocument, true
    removeOnFocus document.documentElement
  , 1)
, false)
