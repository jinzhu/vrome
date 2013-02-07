Tab = (->
  copyUrl = ->
    url = document.location.href
    Clipboard.copy url
    CmdBox.set
      title: "[Copied] " + url
      timeout: 4000

  reload = ->
    Post action: "Tab.reload"
  reloadAll = ->
    Post action: "Tab.reloadAll"
  reloadWithoutCache = ->
    Post
      action: "Tab.reload"
      bypassCache: true

  unpinAll = (option) ->
    option = option or {}
    option.action = "Tab.unpinAll"
    Post option
  move = (option) ->
    option.action = "Tab.move"
    Post option
  close = (option) ->
    option = option or {}
    option.action = "Tab.close"
    Post option
  reopen = ->
    Post
      action: "Tab.reopen"
      count: times()

  togglePin = ->
    Post action: "Tab.togglePin"
  duplicate = ->
    Post
      action: "Tab.duplicate"
      count: times()

  detach = ->
    Post action: "Tab.detach"
  openInIncognito = ->
    Post action: "Tab.openInIncognito"
  markForMerging = (opt) ->
    opt = opt or {}
    opt.action = "Tab.markForMerging"
    Post opt
  selectPrevious = ->
    count = times(true) #raw
    if count
      Post
        action: "Tab.select"
        index: count - 1

    else
      Post action: "Tab.selectPrevious"
  selectLastOpen = ->
    Post
      action: "Tab.selectLastOpen"
      count: times()

  prev = ->
    Post
      action: "Tab.select"
      offset: -1 * times()

  next = ->
    Post
      action: "Tab.select"
      offset: times()

  first = ->
    Post
      action: "Tab.select"
      index: 0

  last = ->
    Post
      action: "Tab.select"
      index: -1

  
  # API
  copyUrl: copyUrl
  reload: reload
  reloadAll: reloadAll
  reloadWithoutCache: reloadWithoutCache
  close: close
  closeAndFoucsLast: ->
    close
      focusLast: true
      count: times()


  closeAndFoucsLeft: ->
    close
      offset: -1
      count: times()


  closeOtherTabs: ->
    close type: "closeOther"

  closeLeftTabs: ->
    close type: "closeLeft"

  closeRightTabs: ->
    close type: "closeRight"

  closePinnedTabs: ->
    close type: "closePinned"

  closeUnPinnedTabs: ->
    close type: "closeUnPinned"

  closeOtherWindows: ->
    close
      otherWindows: true
      type: "otherWindows"


  moveLeft: ->
    move
      direction: "left"
      count: times()


  moveRight: ->
    move
      direction: "right"
      count: times()


  reopen: reopen
  unpinAllTabsInCurrentWindow: unpinAll
  unpinAllTabsInAllWindows: ->
    unpinAll allWindows: true

  prev: prev
  next: next
  first: first
  last: last
  selectPrevious: selectPrevious
  selectLastOpen: selectLastOpen
  togglePin: togglePin
  duplicate: duplicate
  detach: detach
  openInIncognito: openInIncognito
  markForMerging: markForMerging
  markAllForMerging: ->
    markForMerging all: true

  putMarkedTabs: ->
    Post action: "Tab.putMarkedTabs"
)()
