class Tab
  @closed_tabs: []
  @last_open_tabs: []
  @marked_tabs: []
  @activeTabs: {}

  # close the tab and add it to closed tabs list
  remove = (tab) ->
    return unless tab
    Tab.closed_tabs.push tab
    chrome.tabs.remove tab.id

  runWhenComplete = (tabId, command) ->
    chrome.tabs.get tabId, (tab) ->
      if tab.status is "complete"
        chrome.tabs.executeScript tabId, command
      else
        runWhenComplete tabId, command


  @autoComplete: (msg) ->
    [tab, keyword, return_urls] = [getTab(arguments), msg.keyword, []]

    return_urls.push {url: msg.default_urls} if msg.default_urls

    return Post(tab, {action: "Dialog.draw", urls: return_urls, keyword: keyword}) if Option.get("noautocomplete")

    chrome.bookmarks.search keyword, (bookmarks) ->
      start_time = new Date().getTime() - 1000 * 60 * 60 * 24 * 10  # since 10 days ago
      chrome.history.search {text: keyword, maxResults: 30, startTime: start_time}, (historys) ->
        Post tab, {action: "Dialog.draw", urls: return_urls.concat(bookmarks.concat(historys)), keyword: keyword}


  @openUrl: (msg) ->
    [tab, urls] = [getTab(arguments), msg.urls]
    urls = [urls]  if typeof urls is "string"

    [first_url, index] = [urls.shift(), tab.index]

    if msg.newtab
      chrome.tabs.create(url: first_url, index: ++index, selected: false)
    else
      update {url: first_url}, tab

    chrome.tabs.create(url: url, index: ++index, selected: false) for url in urls


  @openFromClipboard: (msg) ->
    url = Clipboard.read()
    url = Option.default_search_url(url)  unless url.isValidURL()
    openUrl {url: url}, getTab(arguments)


  @reopen: (msg) ->
    if Tab.closed_tabs.length > 0
      index = (Tab.closed_tabs.length - msg.count) % Tab.closed_tabs.length
      last_closed_tab = Tab.closed_tabs[index]
      if last_closed_tab
        Tab.closed_tabs.splice index, 1
        chrome.tabs.create url: last_closed_tab.url, index: last_closed_tab.index

  @update: (msg) ->
    [tab, attr] = [getTab(arguments), {}]

    # https://github.com/jashkenas/coffee-script/issues/1617
    attr.url = msg.url  if typeof msg.url isnt "undefined"
    attr.active = msg.active  if typeof msg.active isnt "undefined"
    attr.highlighted = msg.highlighted  if typeof msg.highlighted isnt "undefined"
    attr.pinned = msg.pinned  if typeof msg.pinned isnt "undefined"

    chrome.tabs.update tab.id, attr, (new_tab) ->
      runWhenComplete(new_tab.id, code: msg.callback) if msg.callback


  @move: (msg) ->
    [tab, times, direction] = [getTab(arguments), msg.count, if (msg.direction is "left") then -1 else 1]

    chrome.tabs.query {windowId: tab.windowId}, (tabs) ->
      # ensure index in 0..tabs.length
      newIndex = (tab.index + times * direction) % tabs.length
      chrome.tabs.move tab.id, index: newIndex


  @close: (msg) =>
    [tab, cond, count] = [getTab(arguments), msg.type, Number(msg.count) || 1]

    @selectPrevious.apply "", arguments  if msg.focusLast  # close and select last
    @select.apply "", arguments  if msg.offset  # close and select right/left

    chrome.windows.getAll {populate: true}, (windows) ->
      for w in windows
        for t in w.tabs
          if cond is 'otherWindows'
            remove t if w.id isnt tab.windowId
          else if w.id is tab.windowId
            if (
              ((cond is 'closeOther') and (t.id isnt tab.id)) or
              ((cond is 'closeLeft') and (t.index < tab.index)) or
              ((cond is 'closeRight') and (t.index > tab.index)) or
              ((cond is 'closePinned') and t.pinned) or
              ((cond is 'closeUnPinned') and !t.pinned) or
              (not cond and (t.index >= tab.index) and (t.index < (tab.index + count)))
            )
              remove t


  @select: (msg) ->
    tab = getTab(arguments)
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      index = Math.min(msg.index, tabs.length - 1) if typeof msg.index isnt "undefined"
      index = (tab.index + msg.offset) % tabs.length if typeof msg.offset isnt "undefined"
      chrome.tabs.update (tabs[index] ? tab).id, selected: true


  @selectPrevious: ->
    tab = getTab(arguments)
    chrome.tabs.update Tab.activeTabs[tab.windowId]["last_tab_id"], selected: true

  @selectLastOpen: (msg) ->
    index = (Tab.last_open_tabs.length - msg.count) % Tab.last_open_tabs.length
    update {active: true}, Tab.last_open_tabs[index]


  @reload: (msg) ->
    tab = getTab(arguments)
    chrome.tabs.reload tab.id, if msg.bypassCache then {bypassCache: true} else {}


  @reloadAll: (msg) ->
    tab = getTab(arguments)
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      chrome.tabs.reload(t.id) for t in tabs


  @togglePin: ->
    tab = getTab(arguments)
    update {pinned: not tab.pinned}, tab


  @unpinAll: (msg) ->
    tab = getTab(arguments)
    chrome.windows.getAll {populate: true}, (windows) ->
      for w in windows
        for t in w.tabs when t.pinned && (msg.allWindows || (w.id is tab.windowId))
          update {pinned: false}, t


  @duplicate: (msg) ->
    tab = getTab(arguments)
    [index, count] = [tab.index, msg.count ? 1]
    chrome.tabs.create {url: tab.url, index: ++index, selected: false} while count-- > 0


  @detach: ->
    tab = getTab(arguments)
    chrome.windows.create {tabId: tab.id, incognito: tab.incognito}


  @makeLastTabIncognito: ->
    tab = Tab.last_open_tabs[Tab.last_open_tabs.length - 1]
    openInIncognito tab if tab


  @openInIncognito: ->
    tab = getTab(arguments)
    incognito = not tab.incognito
    chrome.tabs.query {windowId: tab.windowId}, (tabs) ->
      if tabs.length is 1
        duplicate {count: 1}, tab
        Window.moveTabToWindowWithIncognito tab, incognito, true, (t) -> chrome.windows.remove t.windowId
      else
        Window.moveTabToWindowWithIncognito tab, incognito, true, (t) -> chrome.tabs.remove t.id


  @markForMerging: (msg) ->
    tab = getTab(arguments)

    chrome.tabs.query {windowId: tab.windowId}, (tabs) ->
      tabs = [tab] unless msg.all
      for t in tabs
        if t in Tab.marked_tabs
          delete Tab.marked_tabs.indexOf(t)
        else
          Tab.marked_tabs.push t

      Tab.marked_tabs = jQuery.unique(t for t in Tab.marked_tabs when not t)
      title = "#{Tab.marked_tabs.length} Tab(s) marked"
      Post tab, {action: "CmdBox.set", title: title, timeout: 4000}


  @putMarkedTabs: ->
    tab = getTab(arguments)
    return if Tab.marked_tabs.length == 0

    chrome.tabs.move Tab.marked_tabs, {windowId: tab.windowId, index: tab.index + 1}, (tmp) ->
      Post tab, {action: "CmdBox.set", title: "#{tmp.length} Tab(s) moved", timeout: 4000}
      Tab.marked_tabs = []


root = exports ? window
root.Tab = Tab
