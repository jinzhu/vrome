class window.Buffer
  [bufferGotoMode, closeMatchMode, keepMatchMode] = []

  @reset: ->
    [bufferGotoMode, closeMatchMode, keepMatchMode] = []

  @gotoFirstMatchHandle: (keyword=null) -> # Enter
    return unless keyword? or bufferGotoMode
    Post action: 'Buffer.gotoFirstMatch', keyword: (keyword ? CmdBox.get().content).trim()
    bufferGotoMode = false
    CmdBox.remove()

  @gotoFirstMatch: ->
    if count = times(true)
      Post action: 'Tab.select', index: count - 1
    else
      bufferGotoMode = true
      CmdBox.set title: 'Goto Buffer', content: ''
  desc @gotoFirstMatch, 'Go to {count} tab or the first matched tab where title / url matches string'

  @deleteMatchHandle: (keyword=null) ->
    return unless keyword? or closeMatchMode
    Post action: 'Buffer.deleteMatch', keyword: (keyword ? CmdBox.get().content).trim()
    closeMatchMode = false
    CmdBox.remove()
  desc @deleteMatchHandle, 'Close all matched tabs: like `B` in normal mode'

  @deleteMatch: ->
    if count = times(true)
      Post action: 'Tab.close', index: count - 1
    else
      closeMatchMode = true
      CmdBox.set title: 'Delete Matched Buffer', content: ''
  desc @deleteMatch, 'Same as `b`, but close matched tabs'

  @deleteNoteMatchHandle: (keyword=null) ->
    return unless keyword? or keepMatchMode
    Post action: 'Buffer.deleteNotMatch', keyword: (keyword ? CmdBox.get().content).trim()
    keepMatchMode = false
    CmdBox.remove()
  desc @deleteNoteMatchHandle, 'Keep all matched tabs, close others: like `<M-b>` in normal mode'

  @deleteNotMatch: ->
    CmdBox.set title: 'Keep Matched Buffer', content: ''
    keepMatchMode = true
  desc @deleteNotMatch, 'Like `B`, but keep matched tabs, close others'
