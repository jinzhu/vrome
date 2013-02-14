class Buffer
  [bufferGotoMode, bufferMatchMode] = [false, false]

  @gotoFirstMatchHandle: -> # Enter
    return unless bufferGotoMode
    Post action: "Buffer.gotoFirstMatch", keyword: CmdBox.get().content
    bufferGotoMode = false
    CmdBox.remove()

  @gotoFirstMatch: ->
    if count = times(true)
      Post action: "Tab.select", index: count - 1
    else
      bufferGotoMode = true
      CmdBox.set title: "Goto Buffer", content: ""


  @deleteMatchHandle: ->
    return if not bufferMatchMode
    Post action: "Buffer.deleteMatch", keyword: keyword ? CmdBox.get().content
    bufferMatchMode = false
    CmdBox.remove()

  @deleteMatch: ->
    bufferMatchMode = true
    CmdBox.set title: "Delete Buffer", content: ""


root = exports ? window
root.Buffer = Buffer
