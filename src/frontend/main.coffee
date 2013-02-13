root = exports ? window

root.Post = (msg) ->
  chrome.extension.sendMessage msg, (response) ->

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


extractFunction = (functionName, func) ->
  func = (func ? root)[action] for action in functionName.split(".")
  func

loadMapping = ->
  for catName, commands of CMDS
    for fname, info of commands
      func = extractFunction(fname, window)
      if $.isFunction info.gk
        info.gk()
      else
        keys = []
        if typeof info.k is "string"
          keys.push info.k
        else
          keys = info.k

        for key in keys
          KeyEvent.add key, func, true  if info.i or info.both # imap
          KeyEvent.add key, func  if not info.i or info.both # map


  KeyEvent.add "<C-Enter>", Search.prev, true


addCmdLineCommands = ->
  # TODO: add command line to help + mapping object
  CmdLine.add "help", "show help ", Help.show
  CmdLine.add "bdelete", "buffer delete match", Buffer.deleteMatchHandle, true
  CmdLine.add "mdelete", "mark delete match", Marks.deleteQuickMark, true
  CmdLine.add "make-links", "transforms URLs into clickable links", Page.transformURLs
  CmdLine.add "options", "opens options page", Page.openOptions
  CmdLine.add "toggle-images", "toggle images", Page.hideImages


addErrorLogger = ->
  window.addEventListener "error", ((err) ->
    Debug err
  ), false

try
  addCmdLineCommands()
  addErrorLogger()
  loadMapping()
  runIt [Zoom.init, KeyEvent.init, addErrorLogger]
  runIt [Frame.register, CustomCode.runJS, CustomCode.loadCSS]
catch err
  console.log err
  Debug err
