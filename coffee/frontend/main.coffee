root = exports ? window

root.Post = (msg) ->
  chrome.extension.sendMessage msg, (response) ->

root.isControlKey = (key) ->
  key in ["Control", "Shift", "Alt", "Win"]

root.isCtrlAcceptKey = (key) ->
  key is "<C-Enter>"

root.isAcceptKey = (key) ->
  key in AcceptKey

root.isEscapeKey = (key) ->
  key in CancelKey

root.isCtrlEscapeKey = (key) ->
  return true if Option.get("enable_vrome_key") is key
  key in CtrlEscapeKey

root.AcceptKeyFunction = ->
  Search.next()
  Dialog.openCurrent()
  Buffer.gotoFirstMatchHandle()
  Buffer.deleteMatchHandle()

root.CancelKeyFunction = ->
  Hint.remove()
  InsertMode.blurFocus()
  KeyEvent.reset()
  Search.stop()
  Dialog.stop true
  CmdBox.remove()
  Help.hide true

root.CtrlEscapeKeyFunction = ->
  KeyEvent.enable()
  CancelKeyFunction()


extractFunction = (functionName) ->
  func = (func ? root)[action] for action in functionName.split(".")
  func

loadMapping = ->
  for catName, commands of CMDS
    for funcName, info of commands
      func = extractFunction(funcName)
      if $.isFunction info.gk
        info.gk()
      else
        keys = (if $.isArray(info.k) then info.k else [info.k])
        for key in keys
          KeyEvent.add key, func, true  if info.m and ("i" in info.m) # insert mode
          KeyEvent.add key, func  if not info.m or ("n" in info.m) # normal mode


addErrorLogger = ->
  window.addEventListener "error", ((err) ->
    Debug err
  ), false

try
  loadMapping()
  runIt Settings.init, -> func.call() for func in [Zoom.init, KeyEvent.init, Custom.runJS, Custom.loadCSS]
  runIt [addErrorLogger, Frame.register]
catch err
  Debug err
