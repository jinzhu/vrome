class History
  @search: (msg) ->
    chrome.history.search {text: msg.keyword, startTime: 0}, (history) ->
      Post msg.tab, {action: "Dialog.draw", urls: history, keyword: msg.keyword}


root = exports ? window
root.History = History
