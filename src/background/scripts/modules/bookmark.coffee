Bookmark = (->
  search = (msg) ->
    tab = arguments_[arguments_.length - 1]
    index = undefined
    keyword = msg.keyword
    chrome.bookmarks.search keyword, (bookmarks) ->
      Post tab,
        action: "Dialog.draw"
        urls: bookmarks
        keyword: keyword


  search: search
)()
