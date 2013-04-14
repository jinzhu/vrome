class Search
  [searchMode, direction, lastSearch, findTimeoutID] = [null, null, null, null]
  [highlightClass, highlightCurrentId] = ["__vrome_search_highlight", "__vrome_search_highlight_current"]

  @backward: => @start -1
  desc @backward, "Start backward search (with selected text)"

  @start: (offset=1) ->
    [searchMode, direction] = [true, offset]

    CmdBox.set
      title: (if direction > 0 then "Forward search: ?" else "Backward search: /"),
      pressUp: handleInput, content: getSelected() || lastSearch || ""
  desc @start, "Start forward search (with selected text)"

  @stop: =>
    return unless searchMode
    searchMode = false
    CmdBox.remove()
    @removeHighlights()

  @removeHighlights: ->
    $("body").unhighlight(className: highlightClass)

  handleInput = (e) =>
    return  unless searchMode
    @removeHighlights() unless /Enter/.test(getKey(e)) or isControlKey(getKey(e))
    lastSearch = CmdBox.get().content
    find lastSearch

  find = (keyword) =>
    $('body').highlight(keyword, className: highlightClass)
    @next(0)

  @prev: => @next(-1)
  desc @prev, "Search prev"

  @next: (step=1) ->
    return unless searchMode
    offset = direction * step * times()
    nodes = $(".#{highlightClass}")

    return false if nodes.length is 0
    current_node = nodes.filter("##{highlightCurrentId}").removeAttr("id")
    current_index = Math.max 0, nodes.index(current_node)
    goto_index = rabs(current_index + offset, nodes.length)
    goto_node = $(nodes[goto_index])

    if isElementVisible(goto_node, true) # In full page
      goto_node.attr("id", highlightCurrentId).get(0)?.scrollIntoViewIfNeeded()
  desc @next, "Search next"

  @openCurrentNewTab: => @openCurrent(true)
  desc @openCurrentNewTab, "Open selected element in a new tab"

  @openCurrent: (new_tab) =>
    return unless searchMode
    clickElement $("##{highlightCurrentId}"), {ctrl: new_tab}
    @stop()
  desc @openCurrent, "Open selected element in current tab"


root = exports ? window
root.Search = Search
