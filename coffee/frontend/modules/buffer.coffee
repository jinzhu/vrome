class Buffer
  [bufferGotoMode, bufferMatchMode] = [false, false]

  @gotoFirstMatchHandle: (keyword=null) -> # Enter
    return unless keyword? or bufferGotoMode
    Post action: "Buffer.gotoFirstMatch", keyword: (keyword ? CmdBox.get().content).trim()
    bufferGotoMode = false
    CmdBox.remove()

  @gotoFirstMatch: ->
    if count = times(true)
      Post action: "Tab.select", index: count - 1
    else
      bufferGotoMode = true
      CmdBox.set title: "Goto Buffer", content: ""


  @deleteMatchHandle: (keyword=null) ->
    return unless keyword? or bufferGotoMode
    Post action: "Buffer.deleteMatch", keyword: (keyword ? CmdBox.get().content).trim()
    bufferMatchMode = false
    CmdBox.remove()

  @deleteMatch: ->
    if count = times(true)
      Post action: "Tab.close", index: count - 1
    else
      bufferMatchMode = true
      CmdBox.set title: "Delete Buffer", content: ""


root = exports ? window
root.Buffer = Buffer
