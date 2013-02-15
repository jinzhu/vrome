class Hint
  [newTab, multiMode, hintMode, elements, currentKey] = []
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
  @start: (new_tab, multi_mode) =>
    [hintMode, newTab, multiMode] = [true, current_key, multiMode]
    setMatched(elements = (e for e in $(hintable).not("#_vrome_cmd_input_box") when isElementVisible(e)))
    setSelected 0
    CmdBox.set title: "HintMode", pressDown: handleInput, content: ""

  @remove: ->
    return false unless hintMode
    CmdBox.remove()
    removeHighlightBox()
    hintMode = false

  handleInput = (e) =>
    currentKey = getKey(e)

    # If user are inputing number
    if /^\d$/.test(currentKey) or (currentKey is "<BackSpace>" and @selected isnt 0)
      setSelected(if (currentKey is "<BackSpace>") then parseInt(@selected / 10) else @selected * 10 + Number(currentKey))
      KeyEvent.stopPropagation(e)
    else
      # If key is not Accept key, Reset title
      CmdBox.set title: "HintMode" unless isAcceptKey(currentKey)
      # If key is not Escape key, Reset hints
      setTimeout delayToWaitKeyDown, 20  unless isEscapeKey(currentKey)

  hintMatch = (elem) ->
    filter = CmdBox.get().content.trimFirst(key for key, value of subActions)
    regexp = new RegExp(filter.trimFirst("!"), "im")
    text = $(elem).val() || $(elem).text() || $(elem).attr("placeholder")
    regexp.test(text) or regexp.test(PinYin.shortcut(text)) or regexp.test(PinYin.full(text))


  delayToWaitKeyDown = =>
    setMatched(elem for elem in elements when hintMatch(elem))

    if isCtrlAcceptKey(currentKey)
      execCurrent @matched
    else if isAcceptKey(currentKey) or @matched.length is 1
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
    elems = elems || [$(@matched).get(@selected-1)]

    for elem in elems
      currentAction = getCurrentAction()
      tag_name = $(elem).prop("tagName").toLowerCase()
      type = $(elem).prop("type").toLowerCase()

      if $.isFunction(currentAction)
        @remove() # No multiMode for extend mode
        currentAction elem
      else
        if tag_name in ["a"]
          clickElement elem, {ctrl: newTab}
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

        if multiMode
          setSelected 0
          CmdBox.set title: "HintMode"
        else
          setTimeout @remove, 200


root = exports ? window
root.Hint = Hint
