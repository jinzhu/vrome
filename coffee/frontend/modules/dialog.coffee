class Dialog
  [dialogMode, searchFunc, selected, sources, dialog_mode, lastKeyword, newTab] = [null, 0, null, null, null, null, null]

  [search_results_id, selected_class, selected_quick_num, notice_id] = ["__vrome_searchResults", "__vrome_selected", "__vrome_selected_quick_index", "__vrome_dialog_notice"]


  dialogBox = ->
    if $("#__vrome_dialog").length == 0
      $("body").prepend $("<div>", id: "__vrome_dialog", styles: "bottom:#{$(CmdBox.cmdBox()).height()}px !important;")
    $("#__vrome_dialog")

  freshResultBox = ->
    $("##{search_results_id}").remove()
    dialogBox().append $("<div>", id: search_results_id)
    $("##{search_results_id}")

  highlight = (keyword, text, addition) ->
    text += "\t--\t#{addition}" if addition
    text[0..75].replace RegExp(keyword.escapeRegExp, "g"), "<strong>#{keyword}</strong>"

  notice = (msg) ->
    cmdBox = $(CmdBox.cmdBox())
    if $("##{notice_id}").length == 0
      style = "bottom: 0 !important; right:#{cmdBox.width()}px !important; height:#{cmdBox.height()}px !important; line-height:#{cmdBox.height()}px !important; width: #{dialogBox().width() - cmdBox.width() - 12}px !important"
      console.log style
      $("body").prepend $("<div>", id: notice_id, style: style)
    $("##{notice_id}").val(msg)


  @start: (title, content, search_func, newtab, callback) ->
    [dialogMode, lastKeyword, newTab, searchFunc] = [true, null, newtab, search_func]
    CmdBox.set title: title, pressDown: handleInput, pressUp: callback, content: content
    searchFunc CmdBox.get().content


  @draw: (msg) ->
    return false unless dialogMode
    [dialog_mode, results_box, selected] = [(if msg.urls then "url" else ""), freshResultBox(), 0]
    sources = msg.urls or msg.sources

    return results_box.append $("<div>").html("No results found!") if sources.length is 0

    for source in sources
      result = $("<div>")
      if dialog_mode is "url"
        if $.isArray(source.url)
          result.html ("<a href='#{u}'>#{highlight(msg.keyword, u)}</a>" for u in source.url).join(", ")
        else
          result.html "<a href='#{source.url}'>#{highlight(msg.keyword, source.title, source.url)}</a>"
      else
        result.html = highlight(msg.keyword, source)
      results_box.append result

    drawSelected()

  next = (dirction) ->
    selected += (dirction or 1)
    selected = 0 if selected > sources.length
    selected = selected % sources.length if selected < 0
    drawSelected()

  prev = (dirction) ->
    next 0 - (dirction or 1)

  drawSelected = ->
    results = $("##{search_results_id} div")
    selected_result = results[selected]

    $(".#{selected_quick_num}").remove()

    $(results).removeClass(selected_class)
    $(selected_result).addClass(selected_class)

    for result, index in results[selected..selected+10]
      $(result).prepend $("<span>", {class: selected_quick_num}).text(index+1)

    $(".#{selected_quick_num}").get(-1).scrollIntoViewIfNeeded()

    notice (e.attr("href") for e in $(selected_result).filter("[href]")).join(", ")

  @stop: (force) ->
    if not dialogMode or force
      dialogBox().remove()
      $("##{notice_id}").remove()
      CmdBox.remove()
      dialogMode = false

  handleInput = (e) ->
    key = getKey(e)
    
    if key.match(/<C-(\d)>|<Up>|<S-Tab>|<Down>|<Tab>|Control/)
      if key.match(/<C-(\d)>/)
        next Number(RegExp.$1)
        openCurrent()
      prev()  if key is Option.get("autocomplete_prev")
      next()  if key is Option.get("autocomplete_next")
      prev 10  if key is Option.get("autocomplete_prev_10")
      next 10  if key is Option.get("autocomplete_next_10")
      KeyEvent.stopPropagation e
      return

    setTimeout delayToWaitKeyDown, 20  unless isEscapeKey(key)

  delayToWaitKeyDown = ->
    keyword = CmdBox.get().content
    if lastKeyword isnt keyword
      searchFunc keyword
      lastKeyword = keyword

  @openCurrentNewTab: => @open true
  @open: (keep_open) =>
    setTimeout @openCurrent, 500, keep_open

  @openCurrent: (keep_open) -> #Boolean
    return false if !dialogMode
    href = $(".#{selected_class}").find("a").prop("href")
    Post action: "Tab.openUrl", url: href, newtab: keep_open or newTab
    stop() unless keep_open


root = exports ? window
root.Dialog = Dialog
