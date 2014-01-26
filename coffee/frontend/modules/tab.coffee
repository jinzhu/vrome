class window.Tab
  move = (option={}) ->
    Post $.extend(option, action: 'Tab.move')

  unpinAll = (option={}) ->
    Post $.extend(option, action: 'Tab.unpinAll')

  @copyUrl: ->
    url = document.location.href
    Clipboard.copy url
    CmdBox.set title: "[Copied] #{url}", timeout: 4000
  desc @copyUrl, 'Copy current URL to clipboard'

  @reopen: ->
    Post action: 'Tab.reopen', count: times()
  desc @reopen, 'Reopen the last closed {count} tab'

  @reload: (option={}) ->
    Post $.extend(option, action: 'Tab.reload')
  desc @reload, 'Reload current tab'

  @reloadWithoutCache: =>
    @reload bypassCache: true
  desc @reloadWithoutCache, 'Reload current tab (no cache)'

  @reloadAll: =>
    @reload reloadAll: true
  desc @reloadAll, 'Reload all tabs'

  @togglePin: ->
    Post action: 'Tab.togglePin'
  desc @togglePin, 'Toggle current tab pin on/off'

  @duplicate: ->
    Post action: 'Tab.duplicate', count: times()
  desc @duplicate, 'Duplicate {count} current tab'

  @detach: ->
    Post action: 'Tab.detach'
  desc @detach, 'Detach current tab to a new window'

  @toggleIncognito: ->
    Post action: 'Tab.toggleIncognito'
  desc @toggleIncognito, 'Toggle incognito mode for current tab (Vrome should be enabled in incognito mode)'

  @markForMerging: (option={}) ->
    Post $.extend(option, action: 'Tab.markForMerging')
  desc @markForMerging, 'Mark/unmark current tab for merging (can mark multiple tabs)'

  @markAllForMerging: =>
    @markForMerging all: true
  desc @markAllForMerging, 'Marks all tabs in current window for merging'

  @mergeMarkedTabs: ->
    Post action: 'Tab.mergeMarkedTabs'
  desc @mergeMarkedTabs, 'Merge marked tab(s) to current window'

  @selectPrevious: ->
    if count = times true
      Post action: 'Tab.select', index: count - 1
    else
      Post action: 'Tab.selectPrevious'
  desc @selectPrevious, 'Go to last selected or {count} tab'

  @selectLastOpen: ->
    Post action: 'Tab.selectLastOpen', count: times()
  desc @selectLastOpen, 'Go to last created tab'

  @prev: ->
    Post action: 'Tab.select', offset: -times()
  desc @prev, 'Go to left {count} tab'

  @next: ->
    Post action: 'Tab.select', offset: times()
  desc @next, 'Go to right {count} tab'

  @first: ->
    Post action: 'Tab.select', index: 0
  desc @first, 'Go to first tab'

  @last = ->
    Post action: 'Tab.select', index: -1
  desc @last, 'Go to last tab'

  @close: (option={}) ->
    Post $.extend(option, action: 'Tab.close', count: times true)
  desc @close, 'Close current tab'

  @closeAndFoucsLast: =>
    @close focusLast: true
  desc @closeAndFoucsLast, 'Close current tab and select last selected tab'

  @closeAndFoucsLeft: =>
    @close offset: -1
  desc @closeAndFoucsLeft, 'Close current tab and select left tab'

  @closeOtherTabs: =>
    @close type: 'closeOther'
  desc @closeOtherTabs, 'Close all tabs except current tab'

  @closeLeftTabs: =>
    @close type: 'closeLeft'
  desc @closeLeftTabs, 'Close all or {count} tabs on the left'

  @closeRightTabs: =>
    @close type: 'closeRight'
  desc @closeRightTabs, 'Close all or {count} tabs on the right'

  @closePinnedTabs: =>
    @close type: 'closePinned'
  desc @closePinnedTabs, 'Close pinned tabs'

  @closeUnPinnedTabs: =>
    @close type: 'closeUnPinned'
  desc @closeUnPinnedTabs, 'Close unpinned tabs'

  @moveLeft: ->
    move direction: 'left', count: times()
  desc @moveLeft, 'Move tab {count} left'

  @moveRight: ->
    move direction: 'right', count: times()
  desc @moveRight, 'Move tab {count} right'

  @unpinAllTabsInCurrentWindow: unpinAll
  desc @unpinAllTabsInCurrentWindow, 'Unpin all tabs in current window'

  @unpinAllTabsInAllWindows: -> unpinAll allWindows: true
  desc @unpinAllTabsInAllWindows, 'Unpin all tabs from all windows'
