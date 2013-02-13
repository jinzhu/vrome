class Hint
  [currentHint, new_tab, multi_mode, hintMode, selected, elements, matched, key] = []

  highlight_id = "vrome_highlight"
  subActions =
    ";": focusElement
    "?": showElementInfo
    "[": copyElementUrl
    "{": copyElementText
    "\\": openUrlIncognito
    "/": "search"


  @start: (newTab, multiMode) ->
    [hintMode, new_tab, multi_mode] = [true, newTab, multiMode]
    initHintMode()
    CmdBox.set title: "HintMode", pressDown: handleInput, content: ""

  initHintMode = ->
    [selected, currentHint, subMatched, elements, matched] = [0, false, [], [], []]
    # Get all visible elements
    elements = $("a,input:not([type=hidden]),textarea,select,button,*[onclick]").filter(':visible').not("#_vrome_cmd_input_box")
    setHintIndex elements
    matched = elements

  removeHighlightBox = (create_after_remove) -> # Boolean
    $(elements).find("[#{highlight_id}]").removeAttr(highlight_id)
    $("#__vim_hint_highlight").remove()
    $("body").append $("<div>", id: "__vim_hint_highlight") if create_after_remove
    $("#__vim_hint_highlight")

  setHintIndex = (elems) ->
    highlight_box = removeHighlightBox(true) # create_after_remove
    for elem, i in elems
      span = $("<span>", style: "left:#{$(elem).left()}px;top:#{$(elem).top()}px;", text: i+1)
      $(highlight_box).append span
    setHighlight elems[0], true if elems[0] and elem[0].tagName is "A"

  setHighlight = (elem, set_active) ->
    return false unless elem
    if set_active
      $("a[#{highlight_id}=hint_active]").attr highlight_id, "hint_elem"
      $(elem).attr highlight_id, "hint_active"
    else
      $(elem).attr highlight_id, "hint_elem"

  @getCurrentString = ->
    $.trim CmdBox.get().content


  handleInput = (e) ->
    key = getKey(e)

    # If user are inputing number
    if /^\d$/.test(key) or (key is "<BackSpace>" and selected isnt 0)
      selected = (if (key is "<BackSpace>") then parseInt(selected / 10) else selected * 10 + Number(key))
      CmdBox.set title: "HintMode (#{selected})"
      currentHint = matched[selected - 1]
      setHighlight currentHint, true # set_active
      KeyEvent.stopPropagation(e)
      exec = true  if selected * 10 > matched.length
    else
      # If key is not Accept key, Reset title
      CmdBox.set title: "HintMode" unless isAcceptKey(key)
      # If key is not Escape key, Reset hints
      setTimeout delayToWaitKeyDown, 20  unless isEscapeKey(key)

    if exec
      KeyEvent.stopPropagation(e)
      execSelect(currentHint)

  getCurrentAction = (content) ->
    actionName = (content or CmdBox.get().content).substring(0, 1)
    subActions[actionName]

  ## Sub Actions
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

  hintMatch = (elem) ->
    filter = CmdBox.get().content.trimFirst(getCurrentActionNames())
    regexp = new RegExp(filter.trimFirst("!"), "im")
    text = $(elem).val()
    regexp.test(text) or regexp.test(PinYin.shortcut(text)) or regexp.test(PinYin.full(text))

  delayToWaitKeyDown = ->

    matched = elem for elem in elements when hintMatch(elem)
    setHintIndex matched

    if isCtrlAcceptKey(key)
      for e in matched
        execSelect e
        new_tab = true
    else if isAcceptKey(key) or matched.length is 1
      execSelect (if currentHint then currentHint else matched[0])
    currentHint = false

  execSelect = (elem) ->
    return false if not elem

    currentAction = getCurrentAction()
    tag_name = $(elem).attr("tagName").toLowerCase()
    type = $(elem).attr("type").toLowerCase()

    if $.isFunction(currentAction)
      remove() # No multi_mode for extend mode
      currentAction elem
    else
      if tag_name in ["a"]
        setHighlight elem, true
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
        selected = 0
        CmdBox.set title: "HintMode"
      else
        setTimeout remove, 200


root = exports ? window
root.Hint = Hint
