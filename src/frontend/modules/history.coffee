History = (->
  start = (new_tab) ->
    Dialog.start "History", "", search, new_tab
  search = (keyword) ->
    Post
      action: "History.search"
      keyword: keyword

  back: ->
    history.go -1 * times()

  forward: ->
    history.go 1 * times()

  start: start
  new_tab_start: ->
    start true #new tab
)()
