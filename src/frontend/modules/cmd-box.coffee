class CmdBox
  box_id = "_vrome_cmd_box"
  input_box_id = "_vrome_cmd_input_box"

  cmdBoxTitle = (force_create=false) =>
    elems = $("#_vrome_cmd_box span")
    @cmdBox().append $("<span>") if force_create and elems.length == 0
    $("#_vrome_cmd_box span")

  cmdBoxInput = (force_create=false) =>
    elems = $("#_vrome_cmd_box input")
    @cmdBox().append $("<input>", id: input_box_id) if force_create and elems.length == 0
    $("#_vrome_cmd_box input")

  @isActive: ->
    document.activeElement and (document.activeElement.id is input_box_id)

  @cmdBox: ->
    $("body").prepend $("<div>", id: box_id) if $("##{box_id}").length == 0
    $("##{box_id}")

  @set: (o) ->
    if o.title
      cmdBoxTitle(true).unbind().html(o.title).mousedown o.mouseOverTitle
    if o.content
      input = cmdBoxInput(true)
      input.unbind().val(o.content).keydown(o.pressDown).keyup(o.pressUp).keypress(o.pressPress).focus()
      input.select()  unless o.noHighlight
    setTimeout @remove, Number(o.timeout) if o.timeout

  @get: ->
    title: cmdBoxTitle()?.text() or "", content: cmdBoxInput()?.val() or ""

  @remove: ->
    $("##{box_id}")?.unbind()?.remove()

  @blur: -> cmdBoxInput()?.blur()


root = exports ? window
root.CmdBox = CmdBox
