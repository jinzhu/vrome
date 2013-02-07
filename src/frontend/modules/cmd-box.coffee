CmdBox = (->
  
  # stops all propagations of all events
  
  # title events
  
  # input events
  blur = ->
    cmdBoxInput().blur()  if cmdBoxInput()
  cmdBox = ->
    div = document.getElementById(box_id)
    unless div
      div = document.createElement("div")
      div.setAttribute "id", box_id
      document.body.insertBefore div, document.body.childNodes[0]
    div
  cmdBoxTitle = ->
    document.querySelector "#_vrome_cmd_box span"
  createCmdBoxTitle = ->
    cmdbox = cmdBox()
    span = document.createElement("span")
    cmdbox.appendChild span
    span
  cmdBoxInput = ->
    document.querySelector "#_vrome_cmd_box input"
  createCmdBoxInput = ->
    cmdbox = cmdBox()
    input = document.createElement("input")
    input.setAttribute "id", input_box_id
    cmdbox.appendChild input
    input
  set = (opt) ->
    CmdBox.opt = opt
    if opt.title
      title = cmdBoxTitle() or createCmdBoxTitle()
      title.innerText = opt.title
      title.addEventListener "mouseover", mouseOverTitle, true
      mouseOverTitleFunction = opt.mouseOverTitle  if opt.mouseOverTitle
    if typeof (opt.content) is "string"
      input = cmdBoxInput() or createCmdBoxInput()
      input.value = opt.content
      input.setSelectionRange 0, input.value.length  unless opt.noHighlight
      input.addEventListener "keydown", pressDown, true
      input.addEventListener "keyup", pressUp, true
      input.addEventListener "keypress", pressPress, true
      input.focus()
    pressUpFunction = opt.pressUp  if opt.pressUp
    pressDownFunction = opt.pressDown  if opt.pressDown
    pressPressFunction = opt.pressPress  if opt.pressPress
    setTimeout remove, Number(opt.timeout), [true]  if opt.timeout
    stopAllPropagation = opt.stopAllPropagation  if opt.stopAllPropagation
  get = ->
    title: (if cmdBoxTitle() then cmdBoxTitle().innerText else "")
    content: (if cmdBoxInput() then cmdBoxInput().value else "")
  remove = (usesTimeout) ->
    
    # necessary because if we send a message with a timeout e.g 4000 then start the box again, it will disappear after 4000
    if usesTimeout is `undefined` or (usesTimeout and CmdBox.opt.timeout)
      pressUpFunction = ->

      pressDownFunction = ->

      box = document.getElementById(box_id)
      document.body.removeChild box  if box
  isActive = ->
    document.activeElement and document.activeElement.id is input_box_id
  isCmdBoxInput = (target) ->
    target.getAttribute("id") is input_box_id
  box_id = "_vrome_cmd_box"
  input_box_id = "_vrome_cmd_input_box"
  stopAllPropagation = false
  mouseOverTitleFunction = ->

  mouseOverTitle = (e) ->
    mouseOverTitleFunction.call "", e
    e.stopPropagation()  if stopAllPropagation

  pressUpFunction = ->

  pressUp = (e) ->
    pressUpFunction.call "", e
    e.stopPropagation()  if stopAllPropagation

  pressDownFunction = ->

  pressDown = (e) ->
    pressDownFunction.call "", e
    e.stopPropagation()  if stopAllPropagation

  pressPressFunction = ->

  pressPress = (e) ->
    pressPressFunction.call "", e
    e.stopPropagation()  if stopAllPropagation

  blur: blur
  set: set
  get: get
  remove: remove
  isCmdBoxInput: isCmdBoxInput
  cmdBox: cmdBox
  isActive: isActive
)()
CmdBox.opt
