class window.Search
  [searchMode, direction, lastSearch, nodes, originalX, originalY, justClickedPosition, timeout] = []
  [HIGHLIGHT_CLASS, HIGHLIGHT_CURRENT_ID] = ['__vrome_search_highlight', '__vrome_search_highlight_current']

  @backward: => @start -1
  desc @backward, 'Start backward search (with selected text)'

  $(document.documentElement).click (e) ->
    return unless searchMode
    justClickedPosition = x: e.pageX, y: e.pageY

  title = ->
    if direction > 0 then 'Forward search: /' else 'Backward search: ?'

  @start: (offset=1) ->
    [searchMode, direction, originalX, originalY, justClickedPosition] =
      [true, offset, window.scrollX, window.scrollY]

    CmdBox.set
      title: title(), pressUp: handleInput, content: getSelected() or lastSearch?.text or ''
  desc @start, 'Start forward search (with selected text)'

  @stop: =>
    return unless searchMode
    clearTimeout timeout
    searchMode = false
    scrollTo originalX, originalY if CmdBox.isActive()
    CmdBox.remove()
    @removeHighlights()

  @removeHighlights: ->
    $(document.documentElement).unhighlight className: HIGHLIGHT_CLASS

  handleInput = (e) =>
    return unless searchMode
    key = getKey e
    @removeHighlights() unless key is 'Enter' or isModifierKey key
    lastSearch =
      text:      CmdBox.get().content
      position:  0
      direction: direction
    find false, lastSearch.text

  doHighlight = (inFullPage, keyword) ->
    $(document.documentElement).highlight keyword,
      className:      HIGHLIGHT_CLASS
      filterFunction: (e) -> isElementVisible $(e), inFullPage
    nodes = $(".#{HIGHLIGHT_CLASS}").sort (a, b) ->
      offsetA = $(a).offset()
      offsetB = $(b).offset()
      topDifference = offsetA.top - offsetB.top
      return topDifference if topDifference isnt 0
      offsetA.left - offsetB.left

  find = (inFullPage, keyword) =>
    return scrollTo originalX, originalY if keyword is ''
    clearTimeout timeout
    doHighlight inFullPage, keyword
    if not inFullPage
      if nodes.length is 0
        doHighlight true, keyword
      else
        timeout = setTimeout (-> doHighlight true, keyword), 300
    @next lastSearch.position

  @prev: => @next -1
  desc @prev, 'Find previous'

  onNothingFound = ->
    CmdBox.set title: 'Nothing found'
    scrollTo originalX, originalY

  repeatSearch = (step) =>
    return if not lastSearch or lastSearch.text is ''
    # TODO: show notification on search wrap
    @start lastSearch.direction
    lastSearch.position += step
    find true, lastSearch.text
    InsertMode.blurFocus()

  @next: (step=1) =>
    return repeatSearch step unless searchMode
    return onNothingFound() if nodes.length is 0

    offset = direction * step * times()

    currentNode = nodes.filter("##{HIGHLIGHT_CURRENT_ID}").removeAttr('id')
    currentIndex = Math.max 0, nodes.index(currentNode)

    if justClickedPosition
      if step > 0
        index = 0
        while index < nodes.length
          nodeOffset = $(nodes[index]).offset()
          break if nodeOffset.top > justClickedPosition.y or
            (nodeOffset.top is justClickedPosition.y and
            nodeOffset.left >= justClickedPosition.x)
          index++
      else
        index = nodes.length - 1
        while index >= 0
          nodeOffset = $(nodes[index]).offset()
          break if nodeOffset.top < justClickedPosition.y or
            (nodeOffset.top is justClickedPosition.y and
            nodeOffset.left <= justClickedPosition.x)
          index--

      gotoIndex = if index is nodes.length then 0 else index

      justClickedPosition = null
    else
      gotoIndex = (currentIndex + offset) %% nodes.length

    lastSearch.position = gotoIndex
    $(nodes[gotoIndex]).attr('id', HIGHLIGHT_CURRENT_ID).get(0)?.scrollIntoViewIfNeeded()

    # show notification that search has wrapped around
    cmdBoxTitle = if gotoIndex is currentIndex and step isnt 0
      'No more results found'
    else if offset > 0 and gotoIndex < currentIndex
      'Search hit BOTTOM, continuing at TOP'
    else if offset < 0 and gotoIndex > currentIndex
      'Search hit TOP, continuing at BOTTOM'
    else
      title()
    CmdBox.set title: cmdBoxTitle
  desc @next, 'Find next'

  @openCurrentNewTab: => @openCurrent true
  desc @openCurrentNewTab, 'Open selected element in a new tab'

  @openCurrent: (newTab) ->
    return unless searchMode
    clickElement $("##{HIGHLIGHT_CURRENT_ID}"), ctrl: newTab
    @stop()
  desc @openCurrent, 'Open selected element in current tab'

  @onAcceptKeyPressed: =>
    return unless searchMode
    return @stop() if nodes.length is 0

    if CmdBox.isActive()
      InsertMode.blurFocus()
    else
      @openCurrent false
