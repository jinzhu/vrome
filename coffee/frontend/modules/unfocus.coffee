# TODO: this doesn't work for 'autofocus' attributes

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
  disabledElements = null

document.addEventListener 'DOMContentLoaded', ->
  addOnFocus document.documentElement

window.addEventListener 'load', ->
  setTimeout removeOnFocus, 1
