Buffer = (->
  gotoFirstMatch = (msg) ->
    tab = arguments_[arguments_.length - 1]
    index = undefined
    if /^\d+$/.test(msg.keyword)
      Tab.select index: Number(msg.keyword) - 1
    else
      chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
        regexp = new RegExp(msg.keyword, "i")
        i = 0

        while i < tabs.length
          if regexp.test(tabs[i].url) or regexp.test(tabs[i].title)
            Tab.select index: tabs[i].index
            break
          i++

  deleteMatch = (msg) ->
    tab = arguments_[arguments_.length - 1]
    index = undefined
    chrome.tabs.getAllInWindow tab.windowId, (tabs) ->
      if /^\d+$/.test(msg.keyword)
        chrome.tabs.remove tabs[Number(msg.keyword) - 1].id
      else
        regexp = new RegExp(msg.keyword, "i")
        i = 0

        while i < tabs.length
          Tab.close tabs[i]  if regexp.test(tabs[i].url) or regexp.test(tabs[i].title)
          i++

  gotoFirstMatch: gotoFirstMatch
  deleteMatch: deleteMatch
)()
