Dialog = (->
  start = (title, content, search_callback, newtab, keydowncallback) ->
    isEnabled = true
    last_keyword = null
    newTab = newtab
    search = search_callback
    keydown_callback = keydowncallback
    CmdBox.set
      title: title
      pressDown: handleInput
      
      # TODO: consider renaming/refactoring this
      pressUp: keydown_callback
      content: content

    search CmdBox.get().content
  DialogBox = ->
    box = document.getElementById(box_id)
    cmdBox = CmdBox.cmdBox()
    unless box
      box = document.createElement("div")
      box.setAttribute "id", box_id
      styles = "bottom:" + cmdBox.offsetHeight + "px !important"
      box.setAttribute "style", styles
      document.body.insertBefore box, document.body.childNodes[0]
    box
  freshResultBox = ->
    box = DialogBox()
    results = document.getElementById(search_results_id)
    box.removeChild results  if results
    new_results = document.createElement("div")
    new_results.setAttribute "id", search_results_id
    box.appendChild new_results
    new_results
  draw = (msg) ->
    return false  unless isEnabled
    dialog_mode = "url"  if msg.urls
    results_box = freshResultBox()
    selected = 0
    sources = msg.urls or msg.sources
    if sources.length is 0
      result = document.createElement("div")
      result.innerHTML = "No results found!"
      results_box.appendChild result
      return
    i = 0

    while i < sources.length
      source = sources[i]
      result = document.createElement("div")
      if dialog_mode is "url"
        if source.url instanceof Array
          values = []
          j = 0

          while j < source.url.length
            url = source.url[j]
            values.push "<a href='" + url + "'> " + highlight(msg.keyword, url) + "</a>"
            j++
          result.innerHTML = values.join(", ")
        else
          result.innerHTML = "<a href='" + source.url + "'> " + highlight(msg.keyword, source.title, source.url) + "</a>"
      else
        result.innerHTML = highlight(msg.keyword, source)
      results_box.appendChild result
      i++
    drawSelected()
  highlight = (keyword, text, addition) ->
    unless text
      text = addition
    else text += "\t--\t" + addition  if addition
    text.slice(0, 75).replace RegExp(keyword.escapeRegExp, "g"), "<strong>" + keyword + "</strong>"
  next = (dirction) ->
    selected += (dirction or 1)
    selected = 0  if selected > sources.length
    if selected < 0
      selected = selected + sources.length
      selected = 0  if selected < 0
    drawSelected()
  prev = (dirction) ->
    next 0 - (dirction or 1)
  drawSelected = ->
    results = document.body.querySelectorAll("#" + search_results_id + " div")
    quick_num_elems = document.body.querySelectorAll("." + selected_quick_num)
    i = 0

    while i < quick_num_elems.length
      quick_num_elems[i].parentNode.removeChild quick_num_elems[i]
      i++
    i = 0

    while i < results.length
      result = results[i]
      d_value = i - selected
      if (d_value > 0) and (d_value < 10)
        span = document.createElement("span")
        span.setAttribute "class", selected_quick_num
        span.innerHTML = d_value
        result.insertBefore span, result.childNodes[0]
      if i isnt selected
        result.removeAttribute "class"
      else
        result.setAttribute "class", selected_class
        quick_selects = document.body.querySelectorAll("." + selected_quick_num)
        if quick_selects[quick_selects.length - 1]
          quick_selects[quick_selects.length - 1].scrollIntoViewIfNeeded()
        else
          result.scrollIntoViewIfNeeded()
        current_elements = current()
        if current_elements
          
          # Acts as array. (Actually it is HTMLCollection)
          if current_elements.length
            values = []
            j = 0

            while j < current_elements.length
              values.push current_elements[j].getAttribute("href")
              j++
            notice values.join(",")
          else
            notice current_elements.getAttribute("href")
      i++
  current = ->
    selected_box = document.getElementsByClassName(selected_class)[0]
    selected_box.children  if selected_box
  stop = (force) ->
    if not isEnabled or force
      box = DialogBox()
      document.body.removeChild box  if box
      box = document.getElementById(notice_id)
      document.body.removeChild box  if box
      isEnabled = false
      CmdBox.remove()
  notice = (msg) ->
    box = document.getElementById(notice_id)
    cmdBox = CmdBox.cmdBox()
    unless box
      box = document.createElement("div")
      box.setAttribute "id", notice_id
      styles = "bottom: 0 !important; right:" + cmdBox.offsetWidth + "px !important; height: " + cmdBox.offsetHeight + "px !important; line-height: " + cmdBox.offsetHeight + "px !important; width: " + (DialogBox().offsetWidth - cmdBox.offsetWidth - 12) + "px !important"
      box.setAttribute "style", styles
      document.body.insertBefore box, document.body.childNodes[0]
    box.innerHTML = msg
  handleInput = (e) ->
    key = getKey(e)
    
    # execute callback and if callback return true, we are done
    if keydown_callback and keydown_callback(e)
      isEnabled = false
      KeyEvent.stopPropagation e
      return
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
    if last_keyword isnt keyword
      search keyword
      last_keyword = keyword
  openCurrent = (keep_open) -> #Boolean
    return false  unless isEnabled
    elem = current()
    return false  unless elem
    options = {}
    options[(if Platform.mac then "meta" else "ctrl")] = keep_open or newTab
    clickElement elem, options
    stop()  unless keep_open
  open = (keep_open) -> #Boolean
    setTimeout openCurrent, 500, keep_open
  isEnabled = undefined
  selected = undefined
  sources = undefined
  dialog_mode = undefined
  last_keyword = undefined
  search = undefined
  newTab = undefined
  keydown_callback = undefined
  box_id = "__vrome_dialog"
  search_results_id = "__vrome_searchResults"
  selected_class = "__vrome_selected"
  selected_quick_num = "__vrome_selected_quick_index"
  notice_id = "__vrome_dialog_notice"
  start: start
  draw: draw
  openCurrent: open
  openCurrentNewTab: ->
    open true

  stop: stop
)()
