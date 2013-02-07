Buffer = (->
  gotoFirstMatchHandle = ->
    return  unless bufferGotoMode
    Post
      action: "Buffer.gotoFirstMatch"
      keyword: CmdBox.get().content

    bufferGotoMode = false
    CmdBox.remove()
  gotoFirstMatch = ->
    count = times(true) #raw
    if count
      Post
        action: "Tab.select"
        index: count - 1

    else
      bufferGotoMode = true
      CmdBox.set
        title: "Buffer "
        content: ""

  
  # keyword for CmdLine
  deleteMatchHandle = (keyword) ->
    return  if not keyword and not bufferMatchMode
    Post
      action: "Buffer.deleteMatch"
      keyword: keyword or CmdBox.get().content

    bufferMatchMode = false
    CmdBox.remove()
  deleteMatch = ->
    bufferMatchMode = true
    CmdBox.set
      title: "Delete Buffer"
      content: ""

  bufferGotoMode = undefined
  bufferMatchMode = undefined
  gotoFirstMatch: gotoFirstMatch
  gotoFirstMatchHandle: gotoFirstMatchHandle
  deleteMatch: deleteMatch
  deleteMatchHandle: deleteMatchHandle
)()
