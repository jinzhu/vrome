class window.Dialog
  [dialogMode, searchFunc, tabFunc, newTab, searching, selected] = []

  [SEARCH_RESULT, SELECTED_CLASS, QUICK_NUM, NOTICE_ID, VROME_DIALOG] =
    ['__vrome_search_result', '__vrome_selected', '__vrome_quick_num', '__vrome_dialog_notice', '__vrome_dialog']

  dialogBox = ->
    dialog = $("##{VROME_DIALOG}")
    if dialog.length is 0
      dialog = $('<div>', id: VROME_DIALOG, style: "bottom: #{CmdBox.cmdBox().outerHeight()}px")
      $body.prepend dialog
    dialog

  setResultBox = (results, append=false) ->
    $(".#{SEARCH_RESULT}").remove() unless append
    for result in results
      if $.isArray result
        setResultBox result, true
      else
        dialogBox().append $('<div>', class: SEARCH_RESULT).append(result)
    setSelected 0

  setSelected = (num=0) ->
    [selected, results] = [num, $(".#{SEARCH_RESULT}")]
    $(".#{SELECTED_CLASS}").removeClass SELECTED_CLASS
    notice $(results[selected]).addClass(SELECTED_CLASS).find('a').trigger('onselect').attr('href')

    $(".#{QUICK_NUM}").remove()
    maxNum = Math.min(9, results.length - 1)

    for index in [0..maxNum]
      $(results[rabs(selected + index, results.length)]).prepend $('<span>', class: QUICK_NUM).text(index)

    for index in [maxNum..0]
      $(".#{QUICK_NUM}:contains(#{index})").get(0)?.scrollIntoViewIfNeeded()
    return

  notice = (msg) ->
    cmdBox = $(CmdBox.cmdBox())
    noticeElement = $("##{NOTICE_ID}")
    if noticeElement.length is 0
      # 12 = padding-left (10) + border (1) x 2
      style = "right: #{cmdBox.outerWidth()}px; " +
        "height:#{cmdBox.outerHeight()}px; " +
        "line-height:#{cmdBox.outerHeight()}px; " +
        "width: #{dialogBox().outerWidth() - cmdBox.outerWidth() - 12}px"

      noticeElement = $('<div>', id: NOTICE_ID, style: style)
      $body.prepend noticeElement
    noticeElement.text msg

  buildResult = (s, href) ->
    onClick = (e) ->
      KeyEvent.stopPropagation e
      if not s.onClick?.call '', e
        Post action: 'Tab.openUrl', url: href, newTab: e.ctrlKey

    title = if s.title then "#{s.title} -- " else ''
    description = "#{title}#{s.description ? s.url}"
    $('<a>', href: href ? '#', title: s.title, text: description, click: onClick).bind('onselect', s.onSelect)

  @start: (o) ->
    [dialogMode, newTab, searchFunc, tabFunc] = [true, o.newTab, o.search, o.onTab]
    CmdBox.set title: o.title, pressDown: handleInput, pressUp: o.pressUp, content: o.content ? ''
    do callSearchFunc

  @stop: (force) ->
    return unless dialogMode or force
    box.remove() for box in [dialogBox(), $("##{NOTICE_ID}"), CmdBox]
    dialogMode = false

  @draw: (msg) ->
    return unless dialogMode
    sources = msg.urls or msg.sources
    searching = false

    results = if msg.searching
      searching = true
      [$('<div>').html('Searching...')]
    else if sources.length is 0
      [$('<div>').html('No results found!')]
    else
      for source in sources
        if $.isArray source.url
          buildResult source, url for url in source.url
        else
          buildResult source, source.url

    setResultBox results

  next = (direction=1) ->
    setSelected rabs(selected + direction, $(".#{SEARCH_RESULT}").length)

  prev = (direction=1) ->
    next -direction

  specialKeys = {}
  specialKeys[key] = null for key in [
    '<Up>', '<S-Tab>', '<Down>', '<Tab>', 'Control']
  for key in [0..9]
    specialKeys["<C-#{key}>"] = null
    specialKeys["<M-#{key}>"] = null

  handleInput = (e) =>
    key = getKey e

    if key is '<Tab>'
      tabFunc?.call '', e
    else if key of specialKeys
      if key.match /<(?:C|M)-(\d)>/
        next Number(RegExp.$1)
        @openCurrent()
      prev()  if key is Option.get 'autocomplete_prev'
      next()  if key is Option.get 'autocomplete_next'
      prev 10 if key is Option.get 'autocomplete_prev_10'
      next 10 if key is Option.get 'autocomplete_next_10'
    else if not isEscapeKey key
      clearTimeout @timeout
      @timeout = setTimeout callSearchFunc, 200
      @draw searching: true

  callSearchFunc = ->
    searchFunc CmdBox.get().content

  @openCurrentNewTab: => @openCurrent true
  @openCurrentNewTab.description = 'Open selected URL in a new tab'

  @current: ->
    $(".#{SELECTED_CLASS} a")

  @openCurrent: (keepOpen) =>
    return setTimeout @openCurrent, 100, keepOpen if searching
    return unless dialogMode
    clickElement @current(), ctrl: (keepOpen or newTab)
    @stop() unless keepOpen
