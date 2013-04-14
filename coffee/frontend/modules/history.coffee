class History

  search = (keyword) ->
    Post action: "History.search", keyword: keyword

  @start: (new_tab) ->
    Dialog.start title: "History", search: search, newtab: new_tab
  desc @start, "Filter History with keyword (support Dialog extend mode)"

  @new_tab_start: => @start true

  @back: -> history.go -1 * times()
  desc @back, "Go {count} pages back"

  @forward: -> history.go 1 * times()
  desc @forward, "Go {count} pages forward"


root = exports ? window
root.History = History
