class History
  @search: (msg) ->
    [tab, keyword] = [getTab(arguments), msg.keyword]

    chrome.history.search {text: keyword, startTime: 0}, (historys) ->
      Post tab, {action: "Dialog.draw", urls: historys, keyword: keyword}


root = exports ? window
root.History = History
