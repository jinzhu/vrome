class Hint
  [newTab, multiMode, hintMode, elements, currentKey] = []
  hintable = "a,textarea,select,button,area[href],input:not([type=hidden]),*[onclick],[role],[contenteditable],.js-new-tweets-bar"

  @isHintAble: (elem) ->
    $(elem).parent().find(hintable).toArray().indexOf(elem) != -1

  title = ->
    mode = if multiMode then ['multi mode'] else (if newTab then ['new tab'] else [])
    mode.push sub_action if sub_action = getCurrentAction()?.hint
    "Hint #{if mode.length > 0 then "{#{mode.join(',')}}" else ''}"

  removeHighlightBox = (create_after_remove) -> # Boolean
    $("#__vim_hint_highlight").remove()
    $("body").append $("<div>", {id: "__vim_hint_highlight"}) if create_after_remove
    $("#__vim_hint_highlight")

  freshHints = =>
    highlight_box = removeHighlightBox(true) # create_after_remove

    for elem, index in (@matched ? [])
      hint_key = numberToHintKey(index+1)
      class_name = "normal"
      class_name = "active" if hint_key == (@currentKeys || numberToHintKey(1)) # 1 is selected by default
      class_name = "hidden" if not hint_key.startsWith(@currentKeys) # hide those won't match
      hint_key = $("<key>", text: @currentKeys).get(0).outerHTML + hint_key.trimFirst(@currentKeys) if @currentKeys
      # <span vrome_highlight='class_name'><key>A</key>E</span>
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
    CmdBox.set title: (if @selected > 0 then "#{title()} (#{numberToHintKey(@selected)})" else title())
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
    [key, hint_keys] = ["", hintKeys()]
    while number != 0
      key = hint_keys[number % hint_keys.length] + key
      number = parseInt(number / hint_keys.length)
    key

  hintKeyToNumber = (keys) ->
    [number, hint_keys] = [0, hintKeys()]
    while keys != ""
      number = (number * hint_keys.length) + hint_keys.indexOf(keys[0])
      keys = keys[1..-1]
    number

  @multiModeStart: => @start true, true
  desc @multiModeStart, "Same as `f`, but could open multiple links"

  @newTabStart: => @start true
  desc @newTabStart, "Same as `f`, but open in new tabs"

  @start: (new_tab, multi_mode) =>
    [hintMode, newTab, multiMode] = [true, new_tab, multi_mode]
    setMatched(elements = (e for e in $(hintable).not("#_vrome_cmd_input_box") when isElementVisible(e)))
    setCurrentKeys ""
    CmdBox.set title: title(), pressDown: handleInput, content: ""
  desc @start, "Start Hint mode"
  @start.options = {
    hintkeys:
      description: "Keys used to generate hints"
      example: "set hintkeys=jlkhfsdagwerui"
    useletters:
      description: "Use letters or numbers to generate hints, if equal 0, then hintkeys will be ignored"
      example: "set useletters=1"
  }

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
      setTimeout delayToWaitKeyDown, 20 unless isEscapeKey(currentKey)

  hintMatch = (elem) ->
    invert = getCurrentAction() is invertFilter
    filter = CmdBox.get().content.trimFirst(key for key, value of subActions)
    regexp = new RegExp(filter, "im")

    text = $(elem).val() || $(elem).text() || $(elem).attr("placeholder")
    match = regexp.test(text) or regexp.test(PinYin.shortcut(text)) or regexp.test(PinYin.full(text))
    if (invert and filter isnt "") then !match else match


  delayToWaitKeyDown = =>
    setMatched(elem for elem in elements when hintMatch(elem))

    if isCtrlAcceptKey(currentKey)
      execCurrent @matched
    else if isAcceptKey(currentKey) or @matched.length is 1
      execCurrent()
    else
      CmdBox.set title: title()


  ## Sub Actions
  getCurrentAction = (content) =>
    action_name = (content or CmdBox.get().content).substring(0, 1)
    subActions[action_name]

  showElementInfo = (elem) ->
    CmdBox.set title: elem.outerHTML.escape()
  showElementInfo.hint = "show info"

  focusElement = (elem) ->
    elem.focus()
  focusElement.hint = "focus"

  copyElementUrl = (elem) ->
    text = Url.fixRelativePath($(elem).attr("href"))
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000
  copyElementUrl.hint = "copy url"

  copyElementText = (elem) ->
    text = $(elem).val() || $(elem).text()
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000
  copyElementText.hint = "copy text"

  openUrlIncognito = (elem) ->
    Post action: "Tab.openUrl", url: Url.fixRelativePath($(elem).attr("href")), incognito: true
  openUrlIncognito.hint = "incognito"

  invertFilter = {}
  invertFilter.hint = "invert"

  subActions =
    ";": focusElement
    "?": showElementInfo
    "[": copyElementUrl
    "{": copyElementText
    "\\": openUrlIncognito
    "!": invertFilter


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
        if tag_name is "a"
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
        else
          clickElement elem
        newTab = true

    if multiMode
      setCurrentKeys ""
      CmdBox.set title: title()
    else
      setTimeout @remove, 200


root = exports ? window
root.Hint = Hint
