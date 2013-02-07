InsertMode = (->
  currentElement = ->
    elem = document.activeElement
    try
      if elem
        caret_position = elem.selectionEnd
        value = elem.value or elem.innerText
    elem
  blurFocus = ->
    elem = currentElement()
    elem.blur()  if elem
  focusFirstTextInput = ->
    elems = document.querySelectorAll("input[type=\"text\"],input[type=\"password\"],input[type=\"search\"],input:not([type])")
    valid_elems = []
    i = 0

    while i < elems.length
      # in full screen 
      valid_elems.push elems[i]  if isElementVisible(elems[i], true)
      i++
    elem = valid_elems[times() - 1]
    return false  unless elem
    elem.focus()
    elem.setSelectionRange 0, elem.value.length
  moveToFirstOrSelectAll = ->
    elem = currentElement()
    elem.setSelectionRange 0, (if caret_position is 0 then value.length else 0)
  moveToEnd = ->
    elem = currentElement()
    elem.setSelectionRange value.length, value.length
  deleteForwardChar = ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position + 1)
    elem.setSelectionRange caret_position, caret_position
  deleteBackwardChar = ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position - 1) + value.substr(caret_position)
    elem.setSelectionRange caret_position - 1, caret_position - 1
  deleteBackwardWord = ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "") + value.substr(caret_position)
    position = elem.value.length - (value.length - caret_position)
    elem.setSelectionRange position, position
  deleteForwardWord = ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "")
    elem.setSelectionRange caret_position, caret_position
  deleteToBegin = ->
    elem = currentElement()
    elem.value = value.substr(caret_position)
    elem.setSelectionRange 0, 0
  deleteToEnd = ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position)
    elem.setSelectionRange elem.value.length, elem.value.length
  MoveBackwardWord = ->
    elem = currentElement()
    str = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "")
    elem.setSelectionRange str.length, str.length
  MoveForwardWord = ->
    elem = currentElement()
    position = value.length - value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "").length
    elem.setSelectionRange position, position
  MoveBackwardChar = ->
    elem = currentElement()
    elem.setSelectionRange caret_position - 1, caret_position - 1
  MoveForwardChar = ->
    elem = currentElement()
    elem.setSelectionRange caret_position + 1, caret_position + 1
  externalEditor = ->
    elem = currentElement()
    edit_id = String(Math.random())
    text = elem.value.substr(0, elem.selectionStart)
    line = 1 + text.replace(/[^\n]/g, "").length
    column = 1 + text.replace(/[^]*\n/, "").length
    elem.setAttribute "vrome_edit_id", edit_id
    Post
      action: "Editor.open"
      callbackAction: "InsertMode.externalEditorCallBack"
      data: elem.value
      edit_id: edit_id
      line: line
      col: column

  externalEditorCallBack = (msg) ->
    elem = document.querySelector("[vrome_edit_id=\"" + msg.edit_id + "\"]")
    elem.value = msg.value
    elem.removeAttribute "vrome_edit_id"
  caret_position = undefined
  value = undefined
  
  # elem.removeAttribute('readonly');
  blurFocus: blurFocus
  focusFirstTextInput: focusFirstTextInput
  moveToFirstOrSelectAll: moveToFirstOrSelectAll
  moveToEnd: moveToEnd
  deleteForwardChar: deleteForwardChar
  deleteBackwardChar: deleteBackwardChar
  deleteForwardWord: deleteForwardWord
  deleteBackwardWord: deleteBackwardWord
  deleteToBegin: deleteToBegin
  deleteToEnd: deleteToEnd
  MoveBackwardWord: MoveBackwardWord
  MoveForwardWord: MoveForwardWord
  MoveBackwardChar: MoveBackwardChar
  MoveForwardChar: MoveForwardChar
  externalEditor: externalEditor
  externalEditorCallBack: externalEditorCallBack
)()
