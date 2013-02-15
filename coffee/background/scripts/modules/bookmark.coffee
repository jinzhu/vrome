class Bookmark
  @search: (msg) ->
    [tab, keyword] = [getTab(arguments), msg.keyword]

    drawDialog = (historys) ->
      Post tab, {action: "Dialog.draw", urls: historys, keyword: keyword}

    chrome.bookmarks.search keyword, (bookmarks) ->
      if keyword == ""
        chrome.bookmarks.getRecent(20, drawDialog)
      else
        drawDialog(bookmarks)


root = exports ? window
root.Bookmark = Bookmark
