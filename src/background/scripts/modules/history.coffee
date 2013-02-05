History = (->
  search = (msg) ->
    tab = arguments_[arguments_.length - 1]
    index = undefined
    keyword = msg.keyword
    chrome.history.search
      text: keyword
      startTime: 0
    , (historys) ->
      Post tab,
        action: "Dialog.draw"
        urls: historys
        keyword: keyword


  search: search
)()
