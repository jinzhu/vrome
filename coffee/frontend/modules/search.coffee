class Search
  [searchMode, direction, lastSearch, findTimeoutID] = [null, null, null, null]
  [highlight_class, highlight_current_id] = ["__vrome_search_highlight", "__vrome_search_highlight_current"]

  @backward: => start -1

  @start: (offset=1) ->
    [searchMode, direction] = [true, offset]

    CmdBox.set
      title: (if direction > 0 then "Forward search: ?" else "Backward search: /"),
      pressUp: handleInput, content: getSelected() ? lastSearch ? ""

  handleInput = (e) =>
    return  unless searchMode
    @remove()
    lastSearch = CmdBox.get().content
    find lastSearch

  @stop: =>
    return unless searchMode
    searchMode = false
    @remove()

  find = (keyword) ->
    $('body').highlight(keyword)

  @remove: ->
    $("body").unhighlight()

  @prev: => @next(-1)

  @next: (step=1) ->
    return unless searchMode
    offset = direction * step * times()
    nodes = $(".#{highlight_class}")

    return false if nodes.length is 0
    current_node = nodes.find("##{highlight_current_id}").removeAttr("id")
    current_index = nodes.indexOf(current_node)
    goto_index = rabs(current_index + offset, nodes.length)
    goto_node = $(nodes[goto_index])

    if isElementVisible(goto_node, true) # In full page
      goto_node.attr "id", highlight_current_id
      $(goto_node).get(0)?.scrollIntoViewIfNeeded()

  @openCurrentNewTab: => @openCurrent(false)

  @openCurrent: (new_tab) ->
    return  unless searchMode
    elem = $("##{highlight_current_id}").get(0)
    clickElement elem, {ctrl: new_tab}

  useSelectedValueAsKeyword = ->
    lastSearch = getSelected()
    lastSearch

  @forwardCursor: ->
    @start() if useSelectedValueAsKeyword()

  @backwardCursor: ->
    @start(true) if useSelectedValueAsKeyword()


root = exports ? window
root.Search = Search
