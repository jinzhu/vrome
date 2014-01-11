class Tab
  [closedTabs, @previousTab, @lastOpenTabs, markedTabs] = [[], null, [], []]

  # close the tab and add it to closed tabs list
  remove = (tab) =>
    return unless tab
    @addToClosedTabs tab
    chrome.tabs.remove tab.id

  runWhenComplete = (tabId, command) ->
    chrome.tabs.get tabId, (tab) ->
      if tab.status is 'complete'
        chrome.tabs.executeScript tabId, command
      else
        setTimeout runWhenComplete, 100, tabId, command

  fixUrl = (url) ->
    url = url.trim()
    # file://xxxxx || http://xxxxx
    if url.isValidURL()
      url: url, origin: 'url'
    # /jinzhu || (.. || ./configure) && no space
    else if url[0] in ['/', '.']
      url: fixRelativePath(url), origin: 'url'
    # Like url, for example: google.com
    else if /\w+\.\w+/.test(url) and not /\s/.test url
      url: "http://#{url}", origin: 'url'
    # Local URL, for example: localhost:3000 || dev.local/
    else if /local(host)?($|\/|:)/.test url
      url: "http://#{url}", origin: 'url'
    # google vrome
    else
      searchengines = Option.get 'searchengines'
      name = url.replace /^(\S+)\s.*$/, '$1' # searchengine name: e.g: google
      keyword = encodeURIComponent url.replace(/^\S+\s+(.*)$/, '$1')

      # use the matched searchengine
      if searchengines[name]
        url: searchengines[name].replace('{{keyword}}', keyword), origin: 'search-engine'
      else
        url = encodeURIComponent url
        url: Option.defaultSearchUrl(url), origin: 'search'

  @autoComplete: (msg) ->
    defaultUrl = fixUrl msg.keyword
    if Option.get 'noautocomplete'
      return Post msg.tab,
        action:  'Dialog.draw'
        urls:    defaultUrl
        keyword: msg.keyword

    bookmarks = history = null
    completionItems = Option.get('completion_items').split(',')
    dataToFetch = Number('bookmarks' in completionItems) + Number('history' in completionItems)

    returnUrls = ->
      urls = []
      for order in completionItems
        switch order
          when 'search-engine'
            urls = urls.concat defaultUrl if defaultUrl.origin is 'search-engine'
          when 'url'
            urls = urls.concat defaultUrl if defaultUrl.origin is 'url'
          when 'bookmarks'
            urls = urls.concat bookmarks
          when 'history'
            urls = urls.concat history
          when 'search'
            urls = urls.concat defaultUrl if defaultUrl.origin is 'search'
      Post msg.tab, {action: 'Dialog.draw', urls, keyword: msg.keyword}

    if 'bookmarks' in completionItems
      chrome.bookmarks.search msg.keyword, (bs) ->
        bookmarks = bs
        do returnUrls if --dataToFetch is 0
    if 'history' in completionItems
      startTime = new Date().getTime() - 1000 * 60 * 60 * 24 * 10 # since 10 days ago
      chrome.history.search {text: msg.keyword, maxResults: 30, startTime}, (hs) ->
        history = hs
        do returnUrls if --dataToFetch is 0
  @autoComplete.options =
    completion_items:
      description: 'Sets which items to complete and the order in which they appear'
      example:     'set completion_items=url,search-engine,bookmarks,history,search'

  @openUrl: (msg) =>
    url = fixUrl(msg.url).url

    if msg.incognito
      chrome.windows.create {incognito: true, url}, ->
    else
      if msg.newTab
        # open a new tab next to currently selected tab
        chrome.tabs.create {url, index: (msg.tab.index + 1), active: msg.active or Option.get('follow_new_tab') is 1}
      else
        @update {tab: msg.tab, url}

  @openFromClipboard: (msg) =>
    url = Clipboard.read()
    @openUrl $.extend(msg, {url})

  @reopen: (msg) ->
    if closedTabs.length > 0
      index = (closedTabs.length - msg.count) % closedTabs.length
      lastClosedTab = closedTabs[index]
      if lastClosedTab
        closedTabs.splice index, 1
        chrome.tabs.create lastClosedTab

  @update: (msg) ->
    attr = {}

    # https://github.com/jashkenas/coffee-script/issues/1617
    attr.url         = msg.url         if typeof msg.url         isnt 'undefined'
    attr.active      = msg.active      if typeof msg.active      isnt 'undefined'
    attr.highlighted = msg.highlighted if typeof msg.highlighted isnt 'undefined'
    attr.pinned      = msg.pinned      if typeof msg.pinned      isnt 'undefined'

    chrome.tabs.update msg.tab.id, attr, (tab) ->
      runWhenComplete(tab.id, code: msg.callback) if msg.callback

  @move: (msg) ->
    direction = if msg.direction is 'left' then -1 else 1

    chrome.tabs.query {windowId: msg.tab.windowId}, (tabs) ->
      # ensure index in 0..tabs.length
      newIndex = (msg.tab.index + msg.count * direction) % tabs.length
      chrome.tabs.move msg.tab.id, index: newIndex

  @close: (msg) =>
    [cond, count] = [msg.type, msg.count ? 0]
    index = msg.index ? msg.tab.index

    @selectPrevious.apply '', arguments if msg.focusLast # close and select last
    @select.apply         '', arguments if msg.offset    # close and select right/left

    chrome.windows.getAll populate: true, (windows) ->
      for w in windows
        for tab in w.tabs.reverse()
          if cond is 'otherWindows'
            remove tab if w.id isnt msg.tab.windowId
          else if w.id is msg.tab.windowId
            if (
              (cond is 'closeOther' and tab.id isnt msg.tab.id) or
              (cond is 'closeLeft' and tab.index < index and (if count is 0 then true else tab.index >= index - count)) or
              (cond is 'closeRight' and tab.index > index and (if count is 0 then true else tab.index <= index + count)) or
              (cond is 'closePinned' and tab.pinned) or
              (cond is 'closeUnPinned' and not tab.pinned) or
              (not cond and tab.index >= index and tab.index < index + Math.max(1, count))
            )
              remove tab
      return

  @select: (msg) ->
    chrome.tabs.query windowId: msg.tab.windowId, (tabs) ->
      index = Math.min(msg.index, tabs.length - 1)          if typeof msg.index  isnt 'undefined'
      index = rabs(msg.tab.index + msg.offset, tabs.length) if typeof msg.offset isnt 'undefined'
      chrome.tabs.update tabs.splice(index, 1)[0].id, active: true

  @selectPrevious: =>
    chrome.tabs.update @previousTab.id, active: true if @previousTab

  @selectLastOpen: (msg) =>
    index = rabs(@lastOpenTabs.length - msg.count, @lastOpenTabs.length)
    @update tab: @lastOpenTabs[index], active: true

  @toggleViewSource: (msg) =>
    url = msg.tab.url.replace /^(view-source:)?/, if msg.tab.url.startsWith('view-source:') then '' else 'view-source:'
    @openUrl $.extend(msg, {url})

  @reload: (msg) ->
    if msg.reloadAll
      chrome.tabs.query windowId: msg.tab.windowId, (tabs) ->
        # Reverse reload all tabs to avoid issues in development mode
        chrome.tabs.reload tab.id for tab in tabs.reverse()
        return
    else
      chrome.tabs.reload msg.tab.id, bypassCache: !!msg.bypassCache

  @togglePin: (msg) =>
    @update pinned: not msg.tab.pinned, tab: msg.tab

  @unpinAll: (msg) =>
    chrome.windows.getAll populate: true, (windows) =>
      for w in windows
        for tab in w.tabs when tab.pinned and (msg.allWindows or w.id is msg.tab.windowId)
          @update {pinned: false, tab}
      return

  @duplicate: (msg) ->
    [index, count] = [msg.tab.index, msg.count ? 1]
    chrome.tabs.create url: msg.tab.url, index: ++index, active: false while count-- > 0
    return

  @detach: (msg) ->
    chrome.windows.create tabId: msg.tab.id, incognito: msg.tab.incognito

  @makeLastTabIncognito: =>
    tab = @lastOpenTabs[@lastOpenTabs.length - 1]
    openInIncognito tab if tab

  @toggleIncognito: (msg) ->
    incognito = not msg.tab.incognito
    chrome.tabs.query windowId: msg.tab.windowId, (tabs) ->
      Window.moveTabToWindowWithIncognito msg.tab, incognito, (tab) ->
        chrome.tabs.remove tab.id

  @markForMerging: (msg) ->
    chrome.tabs.query windowId: msg.tab.windowId, (tabs) ->
      tabs = [msg.tab] unless msg.all
      for tab in tabs
        index = markedTabs.indexOf tab.id
        if index isnt -1
          markedTabs.splice(index, 1)
        else if tab.url
          markedTabs.push tab.id

      title = "#{markedTabs.length} Tab(s) marked"
      Post msg.tab, {action: 'CmdBox.set', title, timeout: 4000}

  @mergeMarkedTabs: (msg) ->
    return if markedTabs.length is 0
    chrome.windows.get msg.tab.windowId, (w) ->
      for tabId, index in markedTabs
        chrome.tabs.get tabId, (tab) ->
          if w.incognito is tab.incognito
            chrome.tabs.move tab.id, windowId: w.id, index: -1
          else
            chrome.tabs.create windowId: w.id, url: tab.url
            chrome.tabs.remove tab.id
      markedTabs = []

  @addToClosedTabs: (tab) ->
    for t, index in closedTabs when tab.url is t.url
      closedTabs.splice index, 1
      break
    closedTabs.push url: tab.url, index: tab.index if tab.url isnt 'chrome://newtab/'

root = exports ? window
root.Tab = Tab
