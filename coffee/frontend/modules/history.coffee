class History
  search = (keyword) ->
    Post action: 'History.search', keyword: keyword

  @start: (newTab) ->
    Dialog.start {title: 'History', search, newTab}
  desc @start, 'Filter History with keyword (support Dialog extend mode)'

  @newTabStart: => @start true

  @back: -> history.go -times()
  desc @back, 'Go {count} pages back'

  @forward: -> history.go times()
  desc @forward, 'Go {count} pages forward'

root = exports ? window
root.History = History
