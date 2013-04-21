class Tab
  [@closedTabs, @lastTab, @last_open_tabs, @marked_tabs] = [[], null, [], []]

  # close the tab and add it to closed tabs list
  remove = (tab) =>
    return unless tab
    Tab.addToClosedTabs tab
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


  @openUrl: (msg) =>
    [tab, urls] = [getTab(arguments), msg.urls || msg.url]
    urls = [urls]  if typeof urls is "string"

    [first_url, index] = [urls.shift(), tab.index]

    openUrls = (window) =>
      chrome.tabs.create(windowId: window.id, url: url, index: ++index, selected: false) for url in urls

    if msg.incognito
      chrome.windows.create {incognito: true, url: first_url}, openUrls
    else
      if msg.newtab
        chrome.tabs.create(url: first_url, index: ++index, selected: msg.selected || false)
      else
        @update {url: first_url}, tab
      chrome.windows.getCurrent openUrls

  @openFromClipboard: (msg) =>
    url = Clipboard.read()
    url = Option.default_search_url(url)  unless url.isValidURL()
    @openUrl {url: url, newtab: msg.newtab, selected: msg.selected}, getTab(arguments)


  @reopen: (msg) ->
    if Tab.closedTabs.length > 0
      index = (Tab.closedTabs.length - msg.count) % Tab.closedTabs.length
      last_closed_tab = Tab.closedTabs[index]
      if last_closed_tab
        Tab.closedTabs.splice index, 1
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
    [tab, cond, count] = [getTab(arguments), msg.type, msg.count ? 0]
    index = msg.index ? tab.index

    @selectPrevious.apply "", arguments  if msg.focusLast  # close and select last
    @select.apply "", arguments  if msg.offset  # close and select right/left

    chrome.windows.getAll {populate: true}, (windows) ->
      for w in windows
        for t in w.tabs.reverse()
          if cond is 'otherWindows'
            remove t if w.id isnt tab.windowId
          else if w.id is tab.windowId
            if (
              ((cond is 'closeOther') and (t.id isnt tab.id)) or
              ((cond is 'closeLeft') and (t.index < index) and (if count == 0 then true else t.index >= index - count)) or
              ((cond is 'closeRight') and (t.index > index) and (if count == 0 then true else t.index <= index + count)) or
              ((cond is 'closePinned') and t.pinned) or
              ((cond is 'closeUnPinned') and !t.pinned) or
              (not cond and (t.index >= index) and (t.index < (index + Math.max(1, count))))
            )
              remove t


  @select: (msg) ->
    tab = getTab(arguments)
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      index = Math.min(msg.index, tabs.length - 1) if typeof msg.index isnt "undefined"
      index = rabs(tab.index + msg.offset, tabs.length) if typeof msg.offset isnt "undefined"
      chrome.tabs.update tabs.splice(index, 1)[0].id, selected: true


  @selectPrevious: ->
    tab = getTab(arguments)
    chrome.tabs.update(Tab.lastTab.id, selected: true) if Tab.lastTab

  @selectLastOpen: (msg) =>
    index = rabs(Tab.last_open_tabs.length - msg.count, Tab.last_open_tabs.length)
    @update {active: true}, Tab.last_open_tabs[index]

  @toggleViewSource: (msg) =>
    tab = getTab(arguments)
    url = tab.url.replace /^(view-source:)?/, (if /^view-source:/.test(tab.url) then '' else "view-source:")
    @openUrl {urls: url, newtab: msg.newtab}, tab

  @reload: (msg) ->
    tab = getTab(arguments)
    if msg.reloadAll
      chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
        # Reverse reload all tabs to avoid issues in development mode
        chrome.tabs.reload t.id for t in tabs.reverse()
    else
      chrome.tabs.reload tab.id, {bypassCache: !!msg.bypassCache}


  @togglePin: =>
    tab = getTab(arguments)
    @update {pinned: not tab.pinned}, tab


  @unpinAll: (msg) =>
    tab = getTab(arguments)
    chrome.windows.getAll {populate: true}, (windows) =>
      for w in windows
        for t in w.tabs when t.pinned && (msg.allWindows || (w.id is tab.windowId))
          @update {pinned: false}, t


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


  @toggleIncognito: =>
    tab = getTab(arguments)
    incognito = not tab.incognito
    chrome.tabs.query {windowId: tab.windowId}, (tabs) ->
        Window.moveTabToWindowWithIncognito tab, incognito, (t) -> chrome.tabs.remove t.id


  @markForMerging: (msg) ->
    tab = getTab(arguments)

    chrome.tabs.query {windowId: tab.windowId}, (tabs) ->
      tabs = [tab] unless msg.all
      for t in tabs
        index = Tab.marked_tabs.indexOf t.id
        if index != -1
          Tab.marked_tabs.splice(index, 1)
        else if t.url
          Tab.marked_tabs.push t.id

      title = "#{Tab.marked_tabs.length} Tab(s) marked"
      Post tab, {action: "CmdBox.set", title: title, timeout: 4000}


  @mergeMarkedTabs: ->
    tab = getTab(arguments)
    return if Tab.marked_tabs.length == 0

    chrome.tabs.move Tab.marked_tabs, {windowId: tab.windowId, index: tab.index + 1}, (tabs) ->
      Post tab, {action: "CmdBox.set", title: "#{if tab.windowId then 1 else tabs.length} Tab(s) moved", timeout: 4000}
      Tab.marked_tabs = []

  @addToClosedTabs: (tab) =>
    index = (t.url for t in @closedTabs).indexOf(tab.url)
    @closedTabs.splice(index, 1) if index != -1
    @closedTabs.push tab if tab.url != "chrome://newtab/"


root = exports ? window
root.Tab = Tab
