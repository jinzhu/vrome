class CmdBox
  [BOX_ID, INPUT_BOX_ID] = ['_vrome_cmd_box', '_vrome_cmd_input_box']

  cmdBoxTitle = (forceCreate) =>
    elems = $("##{BOX_ID} span")
    if forceCreate and elems.length is 0
      @cmdBox().append $('<span>')
      elems = $("##{BOX_ID} span")
    elems

  cmdBoxInput = (forceCreate) =>
    elems = $("##{BOX_ID} input")
    if forceCreate and elems.length is 0
      @cmdBox().append $('<input>', id: INPUT_BOX_ID)
      elems = $("##{BOX_ID} input")
    elems

  @isActive: ->
    document.activeElement?.id is INPUT_BOX_ID

  @cmdBox: ->
    box = $("##{BOX_ID}")
    if box.length is 0
      box = $('<div>', id: BOX_ID)
      $body.prepend box
    box

  @set: (o, forceCreate=true) =>
    if typeof o.title is 'string'
      cmdBoxTitle(forceCreate).unbind().html(o.title).mousedown(o.mouseOverTitle)
    if typeof o.content is 'string'
      input = cmdBoxInput(forceCreate).val(o.content)
      input.unbind().keydown(o.pressDown).keyup(o.pressUp).select() if forceCreate
      input.keydown (e) -> e.stopPropagation() # do not prevent default
      input.keyup   (e) -> e.stopPropagation() # do not prevent default
      if typeof o.selection is 'string'
        [start, length] = [input.val().indexOf(o.selection), o.selection.length]
        input.prop selectionStart: start, selectionEnd: start + length
      else if o.selectLast
        input.prop selectionStart: input.val().length
    setTimeout @remove, Number(o.timeout) if o.timeout

  @softSet: (o) =>
    @set o, false

  @get: ->
    input = cmdBoxInput false
    [content, start, end] = [input.val() or '', input.prop('selectionStart'), input.prop('selectionEnd')]
    _content = "#{content[0...start]}#{content[end..-1]}" # no_selection_content
    argument = content.split(' ')[1..-1].join(' ')
    {title: cmdBoxTitle(false).html() or '', content, selection: content[start..end], _content, argument}

  @remove: ->
    $("##{BOX_ID}").unbind().remove()

  @blur: ->
    cmdBoxInput(false).blur()

root = exports ? window
root.CmdBox = CmdBox
