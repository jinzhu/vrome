class window.Bookmark
  @search: (msg) ->
    drawDialog = (bookmarks) ->
      Post msg.tab, action: 'Dialog.draw', urls: bookmarks, keyword: msg.keyword

    if msg.keyword is ''
      chrome.bookmarks.getRecent 20, drawDialog
    else
      chrome.bookmarks.search msg.keyword, drawDialog
