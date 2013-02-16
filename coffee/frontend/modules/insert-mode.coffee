class InsertMode
  [caret_position, value] = [null, null]

  currentElement = ->
    elem = document.activeElement
    try
      if elem
        caret_position = elem.selectionEnd
        value = elem.value or elem.innerText
    catch err
      Debug err
    elem

  @blurFocus: ->
    $(currentElement()).blur()

  @focusFirstTextInput: ->
    elems = $("input[type=\"text\"],input[type=\"password\"],input[type=\"search\"],input:not([type])").filter(':visible')
    $(elems[times() - 1]).focus().select()

  @moveToFirstOrSelectAll: ->
    currentElement()?.setSelectionRange 0, (if caret_position is 0 then value.length else 0)

  @moveToEnd: ->
    currentElement()?.setSelectionRange value.length, value.length

  @deleteForwardChar: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position + 1)
    elem?.setSelectionRange caret_position, caret_position

  @deleteBackwardChar: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position - 1) + value.substr(caret_position)
    elem?.setSelectionRange caret_position - 1, caret_position - 1

  @deleteBackwardWord: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "") + value.substr(caret_position)
    position = elem.value.length - (value.length - caret_position)
    elem?.setSelectionRange position, position

  @deleteForwardWord: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "")
    elem?.setSelectionRange caret_position, caret_position

  @deleteToBegin: ->
    elem = currentElement()
    elem.value = value.substr(caret_position)
    elem?.setSelectionRange 0, 0

  @deleteToEnd: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position)
    elem?.setSelectionRange elem.value.length, elem.value.length

  @MoveBackwardWord: ->
    elem = currentElement()
    str = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "")
    elem?.setSelectionRange str.length, str.length

  @MoveForwardWord: ->
    elem = currentElement()
    position = value.length - value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "").length
    elem?.setSelectionRange position, position

  @MoveBackwardChar: ->
    elem = currentElement()
    elem.setSelectionRange caret_position - 1, caret_position - 1

  @MoveForwardChar: ->
    elem = currentElement()
    elem.setSelectionRange caret_position + 1, caret_position + 1

  @externalEditor: ->
    elem = currentElement()
    edit_id = String(Math.random())
    text = elem.value.substr(0, elem.selectionStart)
    line = 1 + text.replace(/[^\n]/g, "").length
    column = 1 + text.replace(/[^]*\n/, "").length
    elem.setAttribute "vrome_edit_id", edit_id
    Post action: "Editor.open", callbackAction: "InsertMode.externalEditorCallBack", data: elem.value, edit_id: edit_id, line: line, col: column

  @externalEditorCallBack: (msg) ->
    $("[vrome_edit_id='#{msg.edit_id}']").val(msg.value).removeAttr("vrome_edit_id")


root = exports ? window
root.InsertMode = InsertMode
