class Bookmark
  @search: -> (msg) ->
    [tab, keyword] = [getTab(arguments), msg.keyword]

    chrome.bookmarks.search keyword, (bookmarks) ->
      Post tab, {action: "Dialog.draw", urls: bookmarks, keyword: keyword}


root = exports ? window
root.Bookmark = Bookmark
