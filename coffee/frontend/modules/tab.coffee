class Tab
  move = (option={}) ->
    Post $.extend option, action: "Tab.move"

  unpinAll = (option={}) ->
    Post $.extend option, action: "Tab.unpinAll"

  @copyUrl: ->
    url = document.location.href
    Clipboard.copy url
    CmdBox.set title: "[Copied] #{url}", timeout: 4000

  @reopen: ->
    Post action: "Tab.reopen", count: times()

  @reload: (option={}) ->
    Post $.extend option, action: "Tab.reload"

  @reloadWithoutCache: =>
    @reload bypassCache: true

  @reloadAll: =>
    @reload reloadAll: true

  @togglePin: ->
    Post action: "Tab.togglePin"

  @duplicate: ->
    Post action: "Tab.duplicate", count: times()

  @detach: ->
    Post action: "Tab.detach"

  @openInIncognito: ->
    Post action: "Tab.openInIncognito"

  @markForMerging: (option={}) ->
    Post $.extend option, action: "Tab.markForMerging"

  @markAllForMerging: ->
    @markForMerging all: true

  @putMarkedTabs: ->
    Post action: "Tab.putMarkedTabs"

  @selectPrevious: ->
    if count = times(true)
      Post action: "Tab.select", index: count - 1
    else
      Post action: "Tab.selectPrevious"

  @selectLastOpen: ->
    Post action: "Tab.selectLastOpen", count: times()

  @prev: ->
    Post action: "Tab.select", offset: -1 * times()

  @next: ->
    Post action: "Tab.select", offset: times()

  @first: ->
    Post action: "Tab.select", index: 0

  @last = ->
    Post action: "Tab.select", index: -1

  @close: (option={}) ->
    Post $.extend option, action: "Tab.close"

  @closeAndFoucsLast: =>
    @close focusLast: true, count: times()

  @closeAndFoucsLeft: =>
    @close offset: -1, count: times()

  @closeOtherTabs: =>
    @close type: "closeOther"

  @closeLeftTabs: =>
    @close type: "closeLeft"

  @closeRightTabs: =>
    @close type: "closeRight"

  @closePinnedTabs: =>
    @close type: "closePinned"

  @closeUnPinnedTabs: =>
    @close type: "closeUnPinned"

  @closeOtherWindows: =>
    @close type: "otherWindows"


  @moveLeft: ->
    move direction: "left", count: times()

  @moveRight: ->
    move direction: "right", count: times()


  @unpinAllTabsInCurrentWindow: unpinAll
  @unpinAllTabsInAllWindows: ->
    unpinAll allWindows: true


root = exports ? window
root.Tab = Tab
