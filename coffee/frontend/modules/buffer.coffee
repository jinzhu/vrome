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
  desc @gotoFirstMatch, "Go to {count} tab or the first matched tab where title / url matches string"


  @deleteMatchHandle: (keyword=null) ->
    return unless keyword? or bufferMatchMode
    Post action: "Buffer.deleteMatch", keyword: (keyword ? CmdBox.get().content).trim()
    bufferMatchMode = false
    CmdBox.remove()
  desc @deleteMatchHandle, "Close all matched tabs. like `B` in normal mode"

  @deleteMatch: ->
    if count = times(true)
      Post action: "Tab.close", index: count - 1
    else
      bufferMatchMode = true
      CmdBox.set title: "Delete Buffer", content: ""
  desc @deleteMatch, "Same as `b`, But close matched tabs"


root = exports ? window
root.Buffer = Buffer
