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
  desc @focusFirstTextInput, "Focus the {count} input field"

  @moveToFirstOrSelectAll: ->
    currentElement()?.setSelectionRange 0, (if caret_position is 0 then value.length else 0)
  desc @moveToFirstOrSelectAll, "Move to first words or select all"

  @moveToEnd: ->
    currentElement()?.setSelectionRange value.length, value.length
  desc @moveToEnd, "Move to end"

  @deleteForwardChar: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position + 1)
    elem?.setSelectionRange caret_position, caret_position
  desc @deleteForwardChar, "Delete forward char. <M-(yuio)> for delete back/forward a word/char"

  @deleteBackwardChar: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position - 1) + value.substr(caret_position)
    elem?.setSelectionRange caret_position - 1, caret_position - 1
  desc @deleteBackwardChar, "Delete backward char. <M-(yuio)> for delete back/forward a word/char"

  @deleteBackwardWord: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "") + value.substr(caret_position)
    position = elem.value.length - (value.length - caret_position)
    elem?.setSelectionRange position, position
  desc @deleteBackwardWord, "Delete backward word. <M-(yuio)> for delete back/forward a word/char"

  @deleteForwardWord: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position) + value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "")
    elem?.setSelectionRange caret_position, caret_position
  desc @deleteForwardWord, "Delete forward word. <M-(yuio)> for delete back/forward a word/char"

  @deleteToBegin: ->
    elem = currentElement()
    elem.value = value.substr(caret_position)
    elem?.setSelectionRange 0, 0
  desc @deleteToBegin, "Delete to the beginning of the line"

  @deleteToEnd: ->
    elem = currentElement()
    elem.value = value.substr(0, caret_position)
    elem?.setSelectionRange elem.value.length, elem.value.length
  desc @deleteToEnd, "Delete forwards to end of line"

  @MoveBackwardWord: ->
    elem = currentElement()
    str = value.substr(0, caret_position).replace(/[^\s\n.,]*?.\s*$/, "")
    elem?.setSelectionRange str.length, str.length
  desc @MoveBackwardWord, "Move backward word. <M-(hjkl)> for move back/forward a word/char"

  @MoveForwardWord: ->
    elem = currentElement()
    position = value.length - value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/, "").length
    elem?.setSelectionRange position, position
  desc @MoveBackwardWord, "Move forward word. <M-(hjkl)> for move back/forward a word/char"

  @MoveBackwardChar: ->
    elem = currentElement()
    elem.setSelectionRange caret_position - 1, caret_position - 1
  desc @MoveBackwardChar, "Move backward char. <M-(hjkl)> for move back/forward a word/char"

  @MoveForwardChar: ->
    elem = currentElement()
    elem.setSelectionRange caret_position + 1, caret_position + 1
  desc @MoveForwardChar, "Move forward char. <M-(hjkl)> for move back/forward a word/char"


  @externalEditorCallBack: (msg) ->
    $("[vrome_edit_id='#{msg.edit_id}']").val(msg.value).removeAttr("vrome_edit_id")

  @externalEditor: ->
    elem = currentElement()
    edit_id = String(Math.random())
    text = elem.value.substr(0, elem.selectionStart)
    line = 1 + text.replace(/[^\n]/g, "").length
    column = 1 + text.replace(/[^]*\n/, "").length
    elem.setAttribute "vrome_edit_id", edit_id
    Post action: "Editor.open", callbackAction: "InsertMode.externalEditorCallBack", data: elem.value, edit_id: edit_id, line: line, col: column

  desc @externalEditor, "Launch the external editor"
  @externalEditor.options = {
    editor:
      description: "Set editor command,default 'editor' is 'gvim -f'"
      example: "set editor=gvim -f"
  }


root = exports ? window
root.InsertMode = InsertMode
