class Dialog
  [dialogMode, searchFunc, tabFunc, newTab, searching] = [null, null, null, null, null]

  [SEARCH_RESULT, SELECTED_CLASS, QUICK_NUM, NOTICE_ID] = ["__vrome_search_result", "__vrome_selected", "__vrome_quick_num", "__vrome_dialog_notice"]


  dialogBox = ->
    if $("#__vrome_dialog").length == 0
      $("body").prepend $("<div>", {id: "__vrome_dialog", style: "bottom: #{CmdBox.cmdBox().outerHeight()}px"})
    $("#__vrome_dialog")

  setResultBox = (results, append=false) ->
    $(".#{SEARCH_RESULT}").remove() unless append
    for result in results
      if $.isArray result
        setResultBox result, true
      else
        dialogBox().append $("<div>", {class: SEARCH_RESULT}).append result
    setSelected 0

  setSelected = (num=0) =>
    [@selected, results] = [num, $(".#{SEARCH_RESULT}")]
    $(".#{SELECTED_CLASS}").removeClass SELECTED_CLASS
    notice $(results[@selected]).addClass(SELECTED_CLASS).find("a").trigger("onselect").attr("href")

    $(".#{QUICK_NUM}").remove()
    max_num = Math.min(9, results.length-1)

    for index in [0..max_num]
      $(results[rabs(@selected + index, results.length)]).prepend $("<span>", {class: QUICK_NUM}).text(index)

    for index in [max_num..0]
      $(".#{QUICK_NUM}:contains(#{index})").get(0)?.scrollIntoViewIfNeeded()
    return


  notice = (msg) ->
    cmdBox = $(CmdBox.cmdBox())
    if $("##{NOTICE_ID}").length == 0
      # 12 = padding-left (10) + border (1) x 2
      style = "right: #{cmdBox.outerWidth()}px; height:#{cmdBox.outerHeight()}px; line-height:#{cmdBox.outerHeight()}px; width: #{dialogBox().outerWidth() - cmdBox.outerWidth() - 12}px"
      $("body").prepend $("<div>", id: NOTICE_ID, style: style)
    $("##{NOTICE_ID}").text(msg)


  @start: (o) ->
    [dialogMode, newTab, searchFunc, tabFunc] = [true, o.newTab, o.search, o.ontab]
    CmdBox.set title: o.title, pressDown: handleInput, pressUp: o.callback, content: o.content ? ""
    do callSearchFunc

  @stop: (force) ->
    return unless dialogMode or force
    box.remove() for box in [dialogBox(), $("##{NOTICE_ID}"), CmdBox]
    dialogMode = false

  @draw: (msg) ->
    return false unless dialogMode
    sources = msg.urls or msg.sources
    searching = false

    if msg.searching
      searching = true
      setResultBox [$("<div>").html("Searching...")]
    else if sources.length is 0
      setResultBox [$("<div>").html("No results found!")]
    else
      buildResult = (s, href) ->
        onClick = (e) ->
          unless s.onclick && s.onclick.call("", e)
            Post action: "Tab.openUrl", url: href, newTab: e.ctrlKey
          false

        title = (if s.title then "#{s.title} -- " else "")
        description = "#{title}#{s.description ? s.url}"
        $("<a>", {href: href ? "#", title: s.title, text: description, click: onClick}).bind("onselect", s.onselect)

      results = for source in sources
        if $.isArray(source.url)
          buildResult(source, u) for u in source.url
        else
          buildResult(source, source.url)
      setResultBox results

  next = (direction=1) =>
    setSelected rabs(@selected + direction, $(".#{SEARCH_RESULT}").length)

  prev = (direction=1) ->
    next -1*direction


  handleInput = (e) =>
    key = getKey(e)

    if key.match(/<Tab>/) and tabFunc and tabFunc.call('', e)
      KeyEvent.stopPropagation e
      return true

    if key.match(/<(?:C|M)-(\d)>|<Up>|<S-Tab>|<Down>|<Tab>|Control/)
      KeyEvent.stopPropagation e
      if key.match(/<(?:C|M)-(\d)>/)
        next Number(RegExp.$1)
        @openCurrent()
      prev() if key is Option.get("autocomplete_prev")
      next() if key is Option.get("autocomplete_next")
      prev 10 if key is Option.get("autocomplete_prev_10")
      next 10 if key is Option.get("autocomplete_next_10")
      return

    if not isEscapeKey key
      clearTimeout @timeout
      @timeout = setTimeout callSearchFunc, 200
      Dialog.draw({searching: true})

  callSearchFunc = ->
    searchFunc CmdBox.get().content

  @openCurrentNewTab: => @open true
  @openCurrentNewTab.description = "Open selected URL in new tab"

  @open: (keep_open) =>
    setTimeout @openCurrent, 500, keep_open

  @current: ->
    $(".#{SELECTED_CLASS} a")

  @openCurrent: (keep_open) => #Boolean
    return setTimeout @openCurrent, 100, keep_open if searching
    return false unless dialogMode
    clickElement @current(), {"ctrl": keep_open or newTab}
    @stop() unless keep_open


root = exports ? window
root.Dialog = Dialog
