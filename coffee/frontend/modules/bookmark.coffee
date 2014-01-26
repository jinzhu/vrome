class window.Bookmark
  search = (keyword) ->
    Post action: 'Bookmark.search', keyword: keyword

  @start: (newTab) ->
    Dialog.start { title: 'Bookmark', search, newTab }
  desc @start, 'Filter bookmarks with keyword (support Dialog extend mode)'

  @newTabStart: => @start true
