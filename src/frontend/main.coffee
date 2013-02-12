root = exports ? window

root.Post = (msg) ->
  chrome.extension.sendMessage msg, (response) ->

root.isCtrlAcceptKey = (key) ->
  key is "<C-Enter>"

root.isAcceptKey = (key) ->
  key in AcceptKey

root.isEscapeKey = (key) ->
  key in EscapeKey

root.isCtrlEscapeKey = (key) ->
  return true if Option.get("enable_vrome_key") is key
  key in CtrlEscapeKey


AcceptKeyFunction = ->
  Search.next()
  Dialog.openCurrent()
  Buffer.gotoFirstMatchHandle()
  Buffer.deleteMatchHandle()

CancelKeyFunction = ->
  Hint.remove()
  InsertMode.blurFocus()
  KeyEvent.reset()
  Search.stop()
  Dialog.stop true
  CmdBox.remove()
  Help.hide true

EscapeKeyFunction = ->
  CancelKeyFunction()

CtrlEscapeKeyFunction = ->
  KeyEvent.enable()
  EscapeKeyFunction()

extractFunction = (functionName, context=window) ->
  $(context[func] for func in functionName.split(".")).get(-1)

AcceptKey = CMDS["global"]["AcceptKeyFunction"].k
CancelKey = CMDS["global"]["CancelKeyFunction"].k
EscapeKey = CMDS["global"]["CancelKeyFunction"].k
CtrlEscapeKey = CMDS["global"]["CtrlEscapeKeyFunction"].k

loadMapping = ->
  for commands, catName in CMDS
    for info, fname in comands
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
          KeyEvent.add key, func, true  if info.i or info.both
          KeyEvent.add key, func  if not info.i or info.both

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
  runIt Zoom.init
  runIt [Zoom.init, KeyEvent.init]
  runIt [Frame.register, CustomCode.runJS, CustomCode.loadCSS]
catch err
  Debug err
