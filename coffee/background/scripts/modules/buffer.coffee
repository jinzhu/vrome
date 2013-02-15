class Buffer
  getMatchedTabs = (tabs, keyword) ->
    if /^\d+$/.test(keyword)
      [tabs[Number(keyword) - 1]]
    else
      regexp = new RegExp(keyword, "i")
      tab for tab in tabs when regexp.test(tab.url) or regexp.test(tab.title)

  @gotoFirstMatch: (msg) ->
    [tab, keyword] = [getTab(arguments), msg.keyword]

    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      Tab.select getMatchedTabs(tabs, keyword)[0]

  @deleteMatch: (msg) ->
    [tab, keyword] = [getTab(arguments), msg.keyword]

    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      Tab.close tab for tab in getMatchedTabs(tabs, keyword)


root = exports ? window
root.Buffer = Buffer
