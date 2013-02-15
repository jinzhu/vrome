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
    $("##{box_id}").attr "rand_id", Math.random().toString()

  @set: (o) =>
    if (typeof o.title is "string")
      cmdBoxTitle(true).unbind().text(o.title).mousedown o.mouseOverTitle
    if (typeof o.content is "string")
      input = cmdBoxInput(true)
      input.unbind().val(o.content).keydown(o.pressDown).keyup(o.pressUp).keypress(o.pressPress).focus()
      input.select()  unless o.noHighlight
    setTimeout @remove, Number(o.timeout), @cmdBox().attr("rand_id") if o.timeout

  @get: ->
    title: cmdBoxTitle()?.text() or "", content: cmdBoxInput()?.val() or ""

  @remove: (rand_id=null) ->
    (if rand_id then $("##{box_id}").filter("[rand_id='#{rand_id}']") else $("##{box_id}")).unbind().remove()

  @blur: -> cmdBoxInput()?.blur()


root = exports ? window
root.CmdBox = CmdBox
