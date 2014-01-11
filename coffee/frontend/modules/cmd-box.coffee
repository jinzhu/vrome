class CmdBox
  [BOX_ID, INPUT_BOX_ID] = ['_vrome_cmd_box', '_vrome_cmd_input_box']

  cmdBoxTitle = (forceCreate=false) =>
    elems = $('#_vrome_cmd_box span')
    if forceCreate and elems.length is 0
      elems.remove()
      @cmdBox().append $('<span>')
    $('#_vrome_cmd_box span')

  cmdBoxInput = (forceCreate=false) =>
    elems = $('#_vrome_cmd_box input')
    if forceCreate and elems.length is 0
      elems.remove()
      @cmdBox().append $('<input>', id: INPUT_BOX_ID)
    $('#_vrome_cmd_box input')

  @isActive: ->
    document.activeElement?.id is INPUT_BOX_ID

  @cmdBox: ->
    $('body').prepend $('<div>', id: BOX_ID) if $("##{BOX_ID}").length is 0
    $("##{BOX_ID}").attr 'rand_id', Math.random().toString()

  @set: (o, force=true) =>
    if typeof o.title is 'string'
      cmdBoxTitle(force).unbind().html(o.title).mousedown(o.mouseOverTitle)
    if typeof o.content is 'string'
      input = cmdBoxInput(force).val(o.content)
      input.unbind().keydown(o.pressDown).keyup(o.pressUp).keypress(o.pressPress).select() if force
      if typeof o.selection is 'string'
        [start, length] = [input.val().indexOf(o.selection), o.selection.length]
        input.prop selectionStart: start, selectionEnd: start + length
      else if o.selectLast
        input.prop selectionStart: input.val().length
    setTimeout @remove, Number(o.timeout), @cmdBox().attr('rand_id') if o.timeout

  @softSet: (o) =>
    @set o, false

  @get: () ->
    input = cmdBoxInput()
    [content, start, end] = [input.val() or '', input.prop('selectionStart'), input.prop('selectionEnd')]
    _content = "#{content[0...start]}#{content[end..-1]}" # no_selection_content
    argument = content.split(' ')[1..-1].join(' ')
    {title: cmdBoxTitle().html() or '', content, selection: content[start..end], _content, argument}

  @remove: (randId=null) ->
    (if randId then $("##{BOX_ID}").filter("[rand_id='#{randId}']") else $("##{BOX_ID}")).unbind().remove()

  @blur: -> cmdBoxInput()?.blur()

root = exports ? window
root.CmdBox = CmdBox
