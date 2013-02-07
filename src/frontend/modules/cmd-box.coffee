class CmdBox
  box_id = "_vrome_cmd_box"
  input_box_id = "_vrome_cmd_input_box"

  cmdBoxTitle = ->
    elems = $("#_vrome_cmd_box span")
    elems.length > 0 ? elems : null
  createCmdBoxTitle = =>
    @cmdBox().append $("<span>")
    cmdBoxInput()

  cmdBoxInput = ->
    elems = $("#_vrome_cmd_box input")
    elems.length > 0 ? elems : null
  createCmdBoxInput = =>
    @cmdbox().append $("<input id='#{input_box_id}'>")
    cmdBoxInput()

  @isActive: ->
    document.activeElement and (document.activeElement.id is input_box_id)

  @cmdBox: ->
    $("body").prepend $("<div id='#{box_id}'>") if $("##{box_id}").length == 0
    $("##{box_id}")

  @set: (o) ->
    if o.title
      (cmdBoxTitle() or createCmdBoxTitle()).unbind().val(o.title).mousedown o.mouseOverTitle
    if opt.content
      input = cmdBoxInput() or createCmdBoxInput()
      input.unbind().val(o.content).keydown(o.pressDown).keyup(o.pressUp).keypress(o.pressPress).focus()
      input.select()  unless o.noHighlight
    setTimeout @remove, Number(o.timeout) if o.timeout

  @get: ->
    title: cmdBoxTitle()?.text() or "", content: cmdBoxInput()?.val() or ""

  @remove: ->
    $("##{box_id}")?.unbind()?.remove()

  @blur: -> cmdBoxInput()?.blur()
