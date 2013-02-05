Tab = (->
  runWhenComplete = (tabId, command) ->
    chrome.tabs.get tabId, (tab) ->
      if tab.status is "complete"
        chrome.tabs.executeScript tabId, command
      else
        runWhenComplete tabId, command

  autoComplete = (msg) ->
    tab = arguments_[arguments_.length - 1]
    keyword = msg.keyword
    return_urls = []
    if msg.default_urls
      default_url = {}
      default_url.url = msg.default_urls
      return_urls.push default_url
    if Option.get("noautocomplete")
      Post tab,
        action: "Dialog.draw"
        urls: return_urls
        keyword: keyword

    else
      chrome.bookmarks.search keyword, (bookmarks) ->
        
        # Search start from 10 days ago
        chrome.history.search
          text: keyword
          maxResults: 30
          startTime: (new Date().getTime() - 1000 * 60 * 60 * 24 * 10)
        , (historys) ->
          Post tab,
            action: "Dialog.draw"
            urls: return_urls.concat(bookmarks.concat(historys))
            keyword: keyword



  update = (msg) ->
    tab = arguments_[arguments_.length - 1]
    attr = {}
    attr.url = msg.url  if typeof msg.url isnt "undefined"
    attr.active = msg.active  if typeof msg.active isnt "undefined"
    attr.highlighted = msg.highlighted  if typeof msg.highlighted isnt "undefined"
    attr.pinned = msg.pinned  if typeof msg.pinned isnt "undefined"
    chrome.tabs.update tab.id, attr, (new_tab) ->
      if msg.callback
        runWhenComplete new_tab.id,
          code: msg.callback


  move = (msg) ->
    tab = arguments_[arguments_.length - 1]
    times = msg.count
    chrome.tabs.query
      windowId: tab.windowId
    , (tabs) ->
      return  if tabs.length is 1
      direction = (if msg.direction is "left" then -1 else 1)
      newIndex = (tab.index + times * direction)
      newIndex = newIndex + tabs.length * (direction * -1)  if newIndex < 0 or newIndex >= tabs.length
      chrome.tabs.move tab.id,
        index: newIndex


  close = (msg) ->
    tab = arguments_[arguments_.length - 1]
    Tab.current_closed_tab = tab
    delete msg.count  if msg.count is 1
    cond = msg.type
    if cond or msg.count > 1
      chrome.windows.getAll
        populate: true
      , (windows) ->
        if msg.otherWindows
          
          # filter windows  without pinned tabs
          windows = _.filter(windows, (w) ->
            unless w.id is tab.windowId
              noPinned = true
              _.each w.tabs, (v) ->
                noPinned = false  if v.pinned

              noPinned
          )
        else
          
          # limit to current window
          windows = _.filter(windows, (w) ->
            w.id is tab.windowId
          )
        _.each windows, (w) ->
          tabs = w.tabs
          tabs = _.filter(tabs, (v) ->
            closeMap =
              closeOther: v.id is tab.id or v.pinned
              closeLeft: v.id is tab.id or v.pinned or tab.index < v.index
              closeRight: v.id is tab.id or v.pinned or tab.index > v.index
              closePinned: not v.pinned
              closeUnPinned: v.pinned
              otherWindows: v.windowId is tab.windowId or v.pinned
              count: v.index >= tab.index

            not closeMap[cond]
          )
          _.each tabs, (v, k) ->
            return  if msg.count and k > msg.count
            chrome.tabs.remove v.id



    else
      unless tab.pinned
        chrome.tabs.remove tab.id
        selectPrevious.apply "", arguments_  if msg.focusLast
        # close and select right
        select.apply "", arguments_  if msg.offset
  # close and select left
  reopen = (msg) ->
    if Tab.closed_tabs.length > 0
      index = Tab.closed_tabs.length - msg.count
      last_closed_tab = Tab.closed_tabs[Tab.closed_tabs.length - msg.count]
      if last_closed_tab
        Tab.closed_tabs.splice index, 1
        chrome.tabs.create
          url: last_closed_tab.url
          index: last_closed_tab.index

  select = (msg) ->
    tab = arguments_[arguments_.length - 1]
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      index = null
      index = Math.min(msg.index, tabs.length - 1)  unless typeof msg.index is "undefined"
      unless typeof msg.offset is "undefined"
        index = tab.index + msg.offset
        index = index % tabs.length
      index = index + tabs.length  if index < 0
      tab = tabs[index] or tab
      chrome.tabs.update tab.id,
        selected: true


  selectPrevious = ->
    tab = arguments_[arguments_.length - 1]
    chrome.tabs.update Tab.activeTabs[tab.windowId]["last_tab_id"],
      selected: true

  selectLastOpen = (msg) ->
    index = Tab.last_open_tabs.length - msg.count
    tab = Tab.last_open_tabs[index]
    update
      active: true
    , tab
  filterUnpinnedTabs = (tabs) ->
    
    # only returns unpinned tabs
    # This way we don't reload, close or affect tabs that are pinned -- like chrome behaves
    _.filter tabs, (tab) ->
      not tab.pinned

  reloadAll = (msg) ->
    tab = arguments_[arguments_.length - 1]
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      _.each filterUnpinnedTabs(tabs), (tab) ->
        chrome.tabs.update tab.id,
          url: tab.url
          selected: tab.selected
        , null


  reloadWithoutCache = (msg) ->
    tab = arguments_[arguments_.length - 1]
    chrome.tabs.reload tab.id,
      bypassCache: true

  openUrl = (msg) ->
    tab = arguments_[arguments_.length - 1]
    urls = msg.urls or msg.url
    urls = [urls]  if typeof urls is "string"
    first_url = urls.shift()
    index = tab.index
    if msg.newtab
      chrome.tabs.create
        url: first_url
        index: ++index
        selected: false

    else
      chrome.tabs.update tab.id,
        url: first_url

    i = 0

    while i < urls.length
      chrome.tabs.create
        url: urls[i]
        index: ++index
        selected: false

      i++
  openFromClipboard = (msg) ->
    url = Clipboard.read()
    url = Option.default_search_url(url)  unless url.isValidURL()
    msg.url = url
    openUrl msg, arguments_[arguments_.length - 1]
  unpinAll = (msg) ->
    tab = arguments_[arguments_.length - 1]
    chrome.windows.getAll
      populate: true
    , (windows) ->
      unless msg.allWindows
        windows = _.filter(windows, (w) ->
          w.id is tab.windowId
        )
      _.each windows, (w) ->
        tabs = _.filter(w.tabs, (v) ->
          v.pinned
        )
        
        # no unpinned, then pin all of them
        pinned = false
        if tabs.length is 0
          tabs = w.tabs
          pinned = true
        _.each tabs, (t) ->
          update
            pinned: pinned
          , t



  togglePin = ->
    tab = arguments_[arguments_.length - 1]
    update
      pinned: not tab.pinned
    , tab
  duplicate = (msg) ->
    tab = arguments_[arguments_.length - 1]
    if msg.count > 30
      alert "get outta here! " + msg.count + " tabs! wanna crash your browser buddy?"
      return
    i = 0

    while i < msg.count
      chrome.tabs.create
        url: tab.url
        index: ++tab.index
        selected: false

      i++
  detach = ->
    tab = arguments_[arguments_.length - 1]
    chrome.windows.create
      tabId: tab.id
      incognito: tab.incognito

  makeLastTabIncognito = ->
    tab = Tab.last_open_tabs[Tab.last_open_tabs.length - 1]
    openInIncognito tab  if tab
  openInIncognito = ->
    tab = arguments_[arguments_.length - 1]
    incognito = not tab.incognito
    chrome.tabs.query
      windowId: tab.windowId
    , (tabs) ->
      if tabs.length is 1
        duplicate
          count: 1
        , tab
        Window.moveTabToWindowWithIncognito tab, incognito, true, (tab) -> # create_mode
          chrome.windows.remove tab.windowId

      else
        Window.moveTabToWindowWithIncognito tab, incognito, true, (tab) -> # create_mode
          chrome.tabs.remove tab.id


  
  #
  #   * adds tab ids to a list of tabs waiting to be merged in a new window
  #   
  markForMerging = (msg) ->
    tab = arguments_[arguments_.length - 1]
    
    # add tab or all tabs in window as marked_tabs
    chrome.tabs.query
      windowId: tab.windowId
    , (tabs) ->
      tabs = _.filter(tabs, (v) ->
        not v.pinned
      )
      
      # limit to current tab
      tabs = [tab]  unless msg.all
      title = ""
      _.each tabs, (v) ->
        Tab.marked_tabs = _.uniq(Tab.marked_tabs)
        
        # toggle marked/unmarked
        posi = _.indexOf(Tab.marked_tabs, v.id)
        if posi is -1
          
          # mark it
          Tab.marked_tabs.push v.id
          title = Tab.marked_tabs.length + " Tab(s) marked "
        else
          
          # unmark it
          delete Tab.marked_tabs[posi]

          
          # remove null entries
          Tab.marked_tabs = _.select(Tab.marked_tabs, (vid) ->
            vid?
          )
          title = tabs.length + " Tab(s) unmarked"
          title += " -- " + Tab.marked_tabs.length + " Tab(s) still marked"  if Tab.marked_tabs.length

      Post tab,
        action: "CmdBox.set"
        title: title
        timeout: 4000


  putMarkedTabs = ->
    tab = arguments_[arguments_.length - 1]
    if Tab.marked_tabs.length > 0
      chrome.tabs.move Tab.marked_tabs,
        windowId: tab.windowId
        index: tab.index + 1
      , (tmp) ->
        Post tab,
          action: "CmdBox.set"
          title: tmp.length + " Tab(s) moved"
          timeout: 4000

        Tab.marked_tabs = []

  
  ###
  creates a data structure with
  window_id:
  last_tab_id
  current_tab_id
  
  data structure is used to switch between tabs through various windows
  ###
  initializeCurrentTabs = ->
    chrome.windows.getAll
      populate: true
    , (windows) ->
      _.each windows, (w) ->
        _.each w.tabs, (tab) ->
          if tab.active
            Tab.activeTabs[w.id] =
              last_tab_id: tab.id
              current_tab_id: tab.id



  
  ###
  @deprecated using markForMerging instead
  ###
  merge = ->
    tab = arguments_[arguments_.length - 1]
    Window.moveTabToWindowWithIncognito tab, tab.incognito
  
  ###
  @deprecated using markForMerging instead
  ###
  mergeAll = ->
    tab = arguments_[arguments_.length - 1]
    chrome.tabs.query
      windowId: tab.windowId
    , (tabs) ->
      i = tabs.length - 1

      while i >= 0
        Window.moveTabToWindowWithIncognito tabs[i], tabs[i].incognito
        i--

  update: update
  close: close
  move: move
  reopen: reopen
  select: select
  selectPrevious: selectPrevious
  selectLastOpen: selectLastOpen
  reloadWithoutCache: reloadWithoutCache
  reloadAll: reloadAll
  openUrl: openUrl
  openFromClipboard: openFromClipboard
  togglePin: togglePin
  unpinAll: unpinAll
  duplicate: duplicate
  detach: detach
  openInIncognito: openInIncognito
  merge: merge
  mergeAll: mergeAll
  autoComplete: autoComplete
  markForMerging: markForMerging
  putMarkedTabs: putMarkedTabs
  initializeCurrentTabs: initializeCurrentTabs
  makeLastTabIncognito: makeLastTabIncognito
)()

# Tab.closed_tabs, now_tab, last_selected_tab, current_closed_tab;
Tab.closed_tabs = []
Tab.last_open_tabs = []
Tab.marked_tabs = []
Tab.activeTabs = {}
