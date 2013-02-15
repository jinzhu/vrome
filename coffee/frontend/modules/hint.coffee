class Hint
  [new_tab, multi_mode, hintMode, elements, key] = []
  hintable = "a,input:not([type=hidden]),textarea,select,button,*[onclick]"

  subActions =
    ";": focusElement
    "?": showElementInfo
    "[": copyElementUrl
    "{": copyElementText
    "\\": openUrlIncognito
    "/": "search"

  removeHighlightBox = (create_after_remove) -> # Boolean
    $("#__vim_hint_highlight").remove()
    $("body").append $("<div>", {id: "__vim_hint_highlight"}) if create_after_remove
    $("#__vim_hint_highlight")

  freshHints = =>
    highlight_box = removeHighlightBox(true) # create_after_remove
    for elem, index in (@matched ? [])
      offset = $(elem).offset()
      class_name = (if (index + 1) == (@selected || 1) then "active" else "normal")
      span = $("<span>", {class: class_name, style: "left:#{offset.left-5}px;top:#{offset.top}px;", text: index+1})
      $(highlight_box).append span

  setMatched = (elems) =>
    @matched = elems
    freshHints()

  setSelected = (num) =>
    @selected = num
    freshHints()
    CmdBox.set title: "HintMode (#{@selected})" if @selected > 0
    setTimeout execCurrent, 200 if @selected * 10 > @matched.length

  @multi_mode_start: => @start true, true
  @new_tab_start: => @start true
  @start: (newTab, multiMode) =>
    [hintMode, new_tab, multi_mode] = [true, newTab, multiMode]
    setMatched(elements = (e for e in $(hintable).not("#_vrome_cmd_input_box") when isElementVisible(e)))
    setSelected 0
    CmdBox.set title: "HintMode", pressDown: handleInput, content: ""

  @remove: ->
    return false unless hintMode
    CmdBox.remove()
    removeHighlightBox()
    hintMode = false

  handleInput = (e) =>
    key = getKey(e)

    # If user are inputing number
    if /^\d$/.test(key) or (key is "<BackSpace>" and @selected isnt 0)
      setSelected(if (key is "<BackSpace>") then parseInt(@selected / 10) else @selected * 10 + Number(key))
      KeyEvent.stopPropagation(e)
    else
      # If key is not Accept key, Reset title
      CmdBox.set title: "HintMode" unless isAcceptKey(key)
      # If key is not Escape key, Reset hints
      setTimeout delayToWaitKeyDown, 20  unless isEscapeKey(key)

  hintMatch = (elem) ->
    filter = CmdBox.get().content.trimFirst(key for key, value of subActions)
    regexp = new RegExp(filter.trimFirst("!"), "im")
    text = $(elem).val()
    regexp.test(text) or regexp.test(PinYin.shortcut(text)) or regexp.test(PinYin.full(text))


  delayToWaitKeyDown = =>
    setMatched(elem for elem in elements when hintMatch(elem))

    if isCtrlAcceptKey(key)
      execCurrent @matched
    else if isAcceptKey(key) or @matched.length is 1
      execCurrent()


  ## Sub Actions
  getCurrentAction = (content) ->
    actionName = (content or CmdBox.get().content).substring(0, 1)
    subActions[actionName]

  showElementInfo = (elem) ->
    CmdBox.set title: elem.outerHTML

  focusElement = (elem) ->
    elem.focus()

  copyElementUrl = (elem) ->
    text = Url.fixRelativePath($(elem).attr("href"))
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000

  copyElementText = (elem) ->
    text = $(elem).val()
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000

  openUrlIncognito = (elem) ->
    # FIXME

  execCurrent = (elems=null) =>
    elems = elems || [@matched[@selected-1]]

    for elem in elems
      currentAction = getCurrentAction()
      tag_name = $(elem).prop("tagName").toLowerCase()
      type = $(elem).prop("type").toLowerCase()

      if $.isFunction(currentAction)
        @remove() # No multi_mode for extend mode
        currentAction elem
      else
        if tag_name in ["a"]
          clickElement elem, {ctrl: new_tab}
        else if $(elem).attr("onclick")
          clickElement elem
        else if (tag_name is "input" and (type in ["submit", "button", "reset", "radio", "checkbox"])) or tag_name is "button"
          clickElement elem
        else if tag_name in ["input", "textarea"]
          try
            $(elem).select()
          catch e
            clickElement elem # some website don't use standard submit input.
        else if tag_name is "select"
          $(elem).focus()

        if multi_mode
          setSelected 0
          CmdBox.set title: "HintMode"
        else
          setTimeout @remove, 200


root = exports ? window
root.Hint = Hint
