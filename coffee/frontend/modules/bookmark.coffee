class Bookmark
  search = (keyword) ->
    Post action: "Bookmark.search", keyword: keyword

  @start: (new_tab) ->
    Dialog.start title: "Bookmark", search: search, newtab: new_tab
  desc @start, "Filter bookmarks with keyword (support Dialog extend mode)"

  @new_tab_start: => @start(true)


root = exports ? window
root.Bookmark = Bookmark
