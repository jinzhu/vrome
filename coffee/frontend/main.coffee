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
  Search.openCurrent()
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
desc root.CancelKeyFunction, "Cancel Actions"

root.CtrlEscapeKeyFunction = ->
  KeyEvent.enable()
  CancelKeyFunction()
desc root.CtrlEscapeKeyFunction, "Enable Vrome when in pass-through"

addErrorLogger = ->
  window.addEventListener "error", ((err) ->
    Debug err
  ), false

try
  runIt Settings.init, -> func.call() for func in [Zoom.init, KeyEvent.init, Custom.runJS, Custom.loadCSS]
  runIt [addErrorLogger, Frame.register]
catch err
  Debug err
