class Bookmark
  @search: (msg) ->
    drawDialog = (bookmarks) ->
      Post msg.tab, action: 'Dialog.draw', urls: bookmarks, keyword: msg.keyword

    chrome.bookmarks.search msg.keyword, (bookmarks) ->
      if msg.keyword is ''
        chrome.bookmarks.getRecent 20, drawDialog
      else
        drawDialog bookmarks

root = exports ? window
root.Bookmark = Bookmark
