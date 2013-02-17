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
      hint_key = numberToHintKey(index+1)
      class_name = "normal"
      class_name = "active" if hint_key == (@currentKeys || numberToHintKey(1))
      class_name = "hidden" unless hint_key.startsWith(@currentKeys)
      hint_key = $("<key>", text: @currentKeys).get(0).outerHTML + hint_key.trimFirst(@currentKeys) if @currentKeys
      span = $("<span>", {vrome_highlight: class_name, html: hint_key})
      $(highlight_box).append span
      offset = $(elem).offset()
      span.offset left: offset.left-6, top: offset.top

  setMatched = (elems) =>
    @matched = elems
    freshHints()

  setSelected = (num) =>
    @selected = num
    freshHints()
    CmdBox.set title: (if @selected > 0 then "HintMode (#{numberToHintKey(@selected)})" else "HintMode")
    setTimeout execCurrent, 200 if (@selected * hintKeys().length) > @matched.length

  setCurrentKeys = (str) =>
    @currentKeys = str
    setSelected hintKeyToNumber(@currentKeys)

  hintKeys = ->
    hint_keys = if Option.get("useletters") is 1
      Option.get("hintkeys") || "asdfghjklqwertyuiopzxcvbnm"
    else
      "1234567890"
    # 1234567890 -> 0123456789
    hint_keys[-1..-1] + hint_keys[0..-2]

  numberToHintKey = (number) ->
    key = ""
    while number != 0
      key = hintKeys()[number % hintKeys().length] + key
      number = parseInt(number / hintKeys().length)
    key

  hintKeyToNumber = (keys) ->
    number = 0
    while keys != ""
      number = (number * hintKeys().length) + hintKeys().indexOf(keys[0])
      keys = keys[1..-1]
    number

  @multi_mode_start: => @start true, true
  @new_tab_start: => @start true
  @start: (new_tab, multi_mode) =>
    [hintMode, newTab, multiMode] = [true, new_tab, multi_mode]
    setMatched(elements = (e for e in $(hintable).not("#_vrome_cmd_input_box") when isElementVisible(e)))
    setCurrentKeys ""
    CmdBox.set title: "HintMode", pressDown: handleInput, content: ""

  @remove: ->
    return false unless hintMode
    CmdBox.remove()
    removeHighlightBox()
    hintMode = false

  handleInput = (e) =>
    currentKey = getKey(e)

    # If it is hint key
    if (hintKeys().indexOf(currentKey) isnt -1) or (currentKey is "<BackSpace>" and @selected isnt 0)
      setCurrentKeys(if (currentKey is "<BackSpace>") then @currentKeys[0..-2] else "#{@currentKeys}#{currentKey}")
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
    elems = elems || [@matched[Math.max(0,@selected-1)]]

    for elem in elems
      currentAction = getCurrentAction()
      tag_name = $(elem).prop("tagName")?.toLowerCase()
      type = $(elem).prop("type")?.toLowerCase()

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
          setCurrentKeys ""
          CmdBox.set title: "HintMode"
        else
          setTimeout @remove, 200


root = exports ? window
root.Hint = Hint
