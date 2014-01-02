class Tab
  [@closedTabs, @lastTab, @last_open_tabs, @marked_tabs] = [[], null, [], []]

  # close the tab and add it to closed tabs list
  remove = (tab) =>
    return unless tab
    Tab.addToClosedTabs tab
    chrome.tabs.remove tab.id

  runWhenComplete = (tabId, command) ->
    # TODO: fix this!
    chrome.tabs.get tabId, (tab) ->
      if tab.status is "complete"
        chrome.tabs.executeScript tabId, command
      else
        runWhenComplete tabId, command

  fixUrl = (url) =>
    url = url.trim()
    # file://xxxxx || http://xxxxx
    if (/:\/\//.test(url))
      url
    #  /jinzhu || (.. || ./configure) && no space
    else if /^\//.test(url) || /^\.\.?\/?/.test(url)
      fixRelativePath(url)
    # Like url, for example: google.com
    else if /\w+\.\w+/.test(url) && !/\s/.test(url)
      "#{if url.match("://") then "" else "http://"}#{url}"
    # Local URL, for example: localhost:3000 || dev.local/
    else if /local(host)?($|\/|\:)/.test(url)
      "#{if url.match("://") then "" else "http://"}#{url}"
    # google vrome
    else
      searchengines = Option.get('searchengines')
      name = url.replace(/^(\S+)\s.*$/, "$1"); # searchengine name: e.g: google
      keyword = encodeURIComponent url.replace(/^\S+\s+(.*)$/, "$1")

      # use the matched searchengine
      return searchengines[name].replace "{{keyword}}", keyword if searchengines[name]

      url = encodeURIComponent(url)
      Option.default_search_url(url)

  @autoComplete: (msg) ->
    return Post msg.tab, {action: "Dialog.draw", urls: {url: fixUrl(msg.keyword)}, keyword: msg.keyword} if Option.get("noautocomplete")

    # TODO: do not search bookmarks/history if 'completion_items' doesn't include them
    # TODO: if search-engine matched exactly, put it in front
    chrome.bookmarks.search msg.keyword, (bookmarks) ->
      start_time = new Date().getTime() - 1000 * 60 * 60 * 24 * 10  # since 10 days ago
      chrome.history.search {text: msg.keyword, maxResults: 30, startTime: start_time}, (history) ->
        completionOrder = Option.get('completion_items').split(',')
        urls = []
        for order in completionOrder
          switch order
            when 'bookmarks'
              urls = urls.concat bookmarks
            when 'history'
              urls = urls.concat history
            when 'search'
              urls = urls.concat url: fixUrl(msg.keyword)
        Post msg.tab, {action: "Dialog.draw", urls, keyword: msg.keyword}
  @autoComplete.options = {
    completion_items: {
      description: "Sets which items to complete and the order in which they appear"
      example: "set completion_items=bookmarks,history,search"
    }
  }

  @openUrl: (msg) =>
    url = fixUrl msg.url

    if msg.incognito
      chrome.windows.create {incognito: true, url}, ->
    else
      if msg.newTab
        chrome.tabs.create({url, index: (msg.tab.index + 1), selected: msg.selected || Option.get("follow_new_tab") is 1})
      else
        @update {tab: msg.tab, url}

  @openFromClipboard: (msg) =>
    url = Clipboard.read()
    url = Option.default_search_url(url) unless url.isValidURL()
    @openUrl $.extend(msg, {url})


  @reopen: (msg) ->
    if Tab.closedTabs.length > 0
      index = (Tab.closedTabs.length - msg.count) % Tab.closedTabs.length
      last_closed_tab = Tab.closedTabs[index]
      if last_closed_tab
        Tab.closedTabs.splice index, 1
        chrome.tabs.create url: last_closed_tab.url, index: last_closed_tab.index

  @update: (msg) ->
    attr = {}

    # https://github.com/jashkenas/coffee-script/issues/1617
    attr.url         = msg.url         if typeof msg.url         isnt "undefined"
    attr.active      = msg.active      if typeof msg.active      isnt "undefined"
    attr.highlighted = msg.highlighted if typeof msg.highlighted isnt "undefined"
    attr.pinned      = msg.pinned      if typeof msg.pinned      isnt "undefined"

    chrome.tabs.update msg.tab.id, attr, (tab) ->
      runWhenComplete(tab.id, code: msg.callback) if msg.callback


  @move: (msg) ->
    direction = if (msg.direction is "left") then -1 else 1

    chrome.tabs.query {windowId: msg.tab.windowId}, (tabs) ->
      # ensure index in 0..tabs.length
      newIndex = (msg.tab.index + msg.count * direction) % tabs.length
      chrome.tabs.move msg.tab.id, index: newIndex


  @close: (msg) =>
    [cond, count] = [msg.type, msg.count ? 0]
    index = msg.index ? msg.tab.index

    @selectPrevious.apply "", arguments  if msg.focusLast  # close and select last
    @select.apply "", arguments  if msg.offset  # close and select right/left

    chrome.windows.getAll {populate: true}, (windows) ->
      for w in windows
        for tab in w.tabs.reverse()
          if cond is 'otherWindows'
            remove tab if w.id isnt msg.tab.windowId
          else if w.id is msg.tab.windowId
            if (
              ((cond is 'closeOther') and (tab.id isnt msg.tab.id)) or
              ((cond is 'closeLeft') and (tab.index < index) and (if count == 0 then true else tab.index >= index - count)) or
              ((cond is 'closeRight') and (tab.index > index) and (if count == 0 then true else tab.index <= index + count)) or
              ((cond is 'closePinned') and tab.pinned) or
              ((cond is 'closeUnPinned') and !tab.pinned) or
              (not cond and (tab.index >= index) and (tab.index < (index + Math.max(1, count))))
            )
              remove tab
      return


  @select: (msg) ->
    chrome.tabs.getAllInWindow msg.tab.windowId, (tabs) ->
      index = Math.min(msg.index, tabs.length - 1) if typeof msg.index isnt "undefined"
      index = rabs(msg.tab.index + msg.offset, tabs.length) if typeof msg.offset isnt "undefined"
      chrome.tabs.update tabs.splice(index, 1)[0].id, selected: true


  @selectPrevious: ->
    chrome.tabs.update(Tab.lastTab.id, selected: true) if Tab.lastTab

  @selectLastOpen: (msg) =>
    index = rabs(Tab.last_open_tabs.length - msg.count, Tab.last_open_tabs.length)
    @update tab: Tab.last_open_tabs[index], active: true

  @toggleViewSource: (msg) =>
    url = msg.tab.url.replace /^(view-source:)?/, (if /^view-source:/.test(msg.tab.url) then '' else "view-source:")
    @openUrl $.extend(msg, {url})

  @reload: (msg) ->
    if msg.reloadAll
      chrome.tabs.getAllInWindow msg.tab.windowId, (tabs) ->
        # Reverse reload all tabs to avoid issues in development mode
        chrome.tabs.reload tab.id for tab in tabs.reverse()
        return
    else
      chrome.tabs.reload msg.tab.id, {bypassCache: !!msg.bypassCache}


  @togglePin: (msg) =>
    @update {pinned: not msg.tab.pinned, tab: msg.tab}


  @unpinAll: (msg) =>
    chrome.windows.getAll {populate: true}, (windows) =>
      for w in windows
        for tab in w.tabs when tab.pinned && (msg.allWindows || (w.id is msg.tab.windowId))
          @update {pinned: false, tab}
      return


  @duplicate: (msg) ->
    [index, count] = [msg.tab.index, msg.count ? 1]
    chrome.tabs.create {url: msg.tab.url, index: ++index, selected: false} while count-- > 0
    return


  @detach: (msg) ->
    chrome.windows.create {tabId: msg.tab.id, incognito: msg.tab.incognito}


  @makeLastTabIncognito: ->
    tab = Tab.last_open_tabs[Tab.last_open_tabs.length - 1]
    openInIncognito tab if tab


  @toggleIncognito: (msg) =>
    incognito = not msg.tab.incognito
    chrome.tabs.query {windowId: msg.tab.windowId}, (tabs) ->
      Window.moveTabToWindowWithIncognito msg.tab, incognito, (tab) -> chrome.tabs.remove tab.id


  @markForMerging: (msg) ->
    chrome.tabs.query {windowId: msg.tab.windowId}, (tabs) ->
      tabs = [msg.tab] unless msg.all
      for tab in tabs
        index = Tab.marked_tabs.indexOf tab.id
        if index != -1
          Tab.marked_tabs.splice(index, 1)
        else if tab.url
          Tab.marked_tabs.push tab.id

      title = "#{Tab.marked_tabs.length} Tab(s) marked"
      Post msg.tab, {action: "CmdBox.set", title: title, timeout: 4000}


  @mergeMarkedTabs: (msg) ->
    return if Tab.marked_tabs.length == 0
    chrome.windows.get msg.tab.windowId, (window) ->
      for tabId, index in Tab.marked_tabs
        chrome.tabs.get tabId, (tab) ->
          if window.incognito is tab.incognito
            chrome.tabs.move tab.id, {windowId: window.id, index: -1}
          else
            chrome.tabs.create windowId: window.id, url: tab.url
            chrome.tabs.remove tab.id
      Tab.marked_tabs = []

  @addToClosedTabs: (tab) =>
    index = (tab.url for tab in @closedTabs).indexOf(tab.url)
    @closedTabs.splice(index, 1) if index != -1
    @closedTabs.push tab if tab.url != "chrome://newtab/"


root = exports ? window
root.Tab = Tab
