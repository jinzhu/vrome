class History

  search = (keyword) ->
    Post action: "History.search", keyword: keyword

  @start: (new_tab) ->
    Dialog.start "History", "", search, new_tab

  @new_tab_start: -> @start true

  @back: -> history.go -1 * times()

  @forward: -> history.go 1 * times()


root = exports ? window
root.History = History
