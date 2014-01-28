class window.Hint
  [newTab, multiMode, hintMode, elements, matched, selected, currentKeys] = []
  HINTABLE = 'a,textarea,select,button,area[href],input:not([type=hidden]),' +
    '*[onclick],*[onmouseover],[contenteditable],.js-new-tweets-bar,' +
    '[role=link],[role=checkbox],[role=button],[role=tab],[role=menubar]'

  @isHintable: (elem) ->
    $(elem).parent().find(HINTABLE).toArray().indexOf(elem) isnt -1

  title = ->
    mode = if multiMode then ['multi mode'] else (if newTab then ['new tab'] else [])
    mode.push subAction if subAction = getCurrentAction()?.hint
    "Hint #{if mode.length > 0 then "{#{mode.join(',')}}" else ''}"

  removeHighlightBox = (createAfterRemove) ->
    $('#__vim_hint_highlight').remove()
    $body.append $('<div>', id: '__vim_hint_highlight') if createAfterRemove
    $('#__vim_hint_highlight')

  freshHints = =>
    highlightBox = removeHighlightBox true

    for elem, index in (matched ? [])
      hintKey = numberToHintKey(index + 1)
      className = 'normal'
      className = 'active' if hintKey is (currentKeys or numberToHintKey 1) # 1 is selected by default
      className = 'hidden' unless hintKey.startsWith currentKeys # hide those won't match
      hintKey = $('<key>', text: currentKeys).get(0).outerHTML + hintKey.trimFirst(currentKeys) if currentKeys
      # <span vrome_highlight='className'><key>A</key>E</span>
      span = $('<span>', vrome_highlight: className, html: hintKey)
      $(highlightBox).append span
      offset = $(elem).offset()
      span.offset left: offset.left - 6, top: offset.top
    return

  setMatched = (_matched) =>
    matched = _matched
    freshHints()

  setSelected = (_selected) =>
    selected = _selected
    freshHints()
    CmdBox.set title: if selected > 0 then "#{title()} (#{numberToHintKey selected})" else title()
    setTimeout execCurrent, 200 if selected * hintKeys().length > matched.length

  setCurrentKeys = (_currentKeys) =>
    currentKeys = _currentKeys
    setSelected hintKeyToNumber(currentKeys)

  hintKeys = ->
    if Option.get('useletters') is 1
      Option.get('hintkeys') or 'asdfghjklqwertyuiopzxcvbnm'
    else
      '0123456789'

  numberToHintKey = (number) ->
    [key, hints] = ['', hintKeys()]
    while number isnt 0
      key = hints[number % hints.length] + key
      number = parseInt(number / hints.length, 10)
    key

  hintKeyToNumber = (keys) ->
    [number, hints] = [0, hintKeys()]
    while keys isnt ''
      number = (number * hints.length) + hints.indexOf keys[0]
      keys = keys[1..-1]
    number

  @multiModeStart: => @start true, true
  desc @multiModeStart, 'Same as `f`, but could open multiple links'

  @newTabStart: => @start true, false
  desc @newTabStart, 'Same as `f`, but open in a new tab'

  @start: (new_tab, multi_mode) =>
    [hintMode, newTab, multiMode] = [true, new_tab, multi_mode]
    setMatched(elements = (e for e in $(HINTABLE).not('#_vrome_cmd_input_box') when isElementVisible $(e)))
    setCurrentKeys ''
    CmdBox.set title: title(), pressDown: handleInput, content: ''
  desc @start, 'Start Hint mode'
  @start.options =
    hintkeys:
      description: 'Keys used to generate hints'
      example:     'set hintkeys=jlkhfsdagwerui'
    useletters:
      description: 'Use letters or numbers to generate hints; if equal 0, then hintkeys will be ignored'
      example:     'set useletters=1'

  @remove: ->
    return unless hintMode
    CmdBox.remove()
    removeHighlightBox false
    hintMode = false

  handleInput = (e) =>
    currentKey = getKey e

    # If it is hint key
    if hintKeys().indexOf(currentKey) isnt -1 or (currentKey is '<BackSpace>' and selected isnt 0)
      setCurrentKeys(if currentKey is '<BackSpace>' then currentKeys[0..-2] else "#{currentKeys}#{currentKey}")
    else
      setTimeout delayToWaitKeyDown, 20, currentKey unless isEscapeKey currentKey

  delayToWaitKeyDown = (currentKey) =>
    setMatched elements.filter(hintMatch)

    if isCtrlAcceptKey currentKey
      execCurrent matched
    else if isAcceptKey(currentKey) or matched.length is 1
      execCurrent()
    else
      CmdBox.set title: title()

  hintMatch = (elem) ->
    invert = getCurrentAction() is invertFilter
    filter = CmdBox.get().content.trimFirst key for key of subActions # parens missing on purpose
    regexp = new RegExp filter, 'im'

    text = $(elem).val() or $(elem).text() or $(elem).attr('placeholder') or $(elem).attr('alt')
    match = regexp.test(text) or regexp.test(PinYin.shortcut text) or regexp.test PinYin.full(text)
    if invert and filter isnt '' then not match else match

  ## Sub Actions
  getCurrentAction = ->
    actionName = CmdBox.get().content.substring(0, 1)
    subActions[actionName]

  showElementInfo = (elem) ->
    CmdBox.set title: elem.outerHTML.escape()
  showElementInfo.hint = 'show info'

  focusElement = (elem) ->
    elem.focus()
  focusElement.hint = 'focus'

  copyElementUrl = (elem) ->
    text = fixRelativePath $(elem).attr('href')
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000
  copyElementUrl.hint = 'copy url'

  copyElementText = (elem) ->
    text = $(elem).val() or $(elem).text()
    Clipboard.copy text
    CmdBox.set title: "[Copied] #{text}", timeout: 4000
  copyElementText.hint = 'copy text'

  openUrlIncognito = (elem) ->
    Post action: 'Tab.openUrl', url: $(elem).attr('href'), incognito: true
  openUrlIncognito.hint = 'incognito'

  invertFilter = {}
  invertFilter.hint = 'invert'

  subActions =
    ';':  focusElement
    '?':  showElementInfo
    '[':  copyElementUrl
    '{':  copyElementText
    '\\': openUrlIncognito
    '!':  invertFilter

  execCurrent = (elems=null) =>
    CmdBox.set content: ''

    elems ?= [matched[Math.max(0, selected - 1)]]

    for elem in elems
      currentAction = getCurrentAction()
      tagName = $(elem).prop('tagName')?.toLowerCase()
      type = $(elem).prop('type')?.toLowerCase()

      if $.isFunction currentAction
        @remove() # No multiMode for extend mode
        currentAction elem
      else
        if tagName is 'a'
          clickElement elem, ctrl: newTab
        else if $(elem).attr('onclick')
          clickElement elem
        else if $(elem).attr('onmouseover')
          $(elem).mouseover()
        else if (tagName is 'input' and type in ['submit', 'button', 'reset', 'radio', 'checkbox']) or tagName is 'button'
          clickElement elem
        else if tagName in ['input', 'textarea']
          try
            $(elem).select()
          catch e
            clickElement elem # some website don't use standard submit input.
        else if tagName is 'select'
          $(elem).focus()
        else
          clickElement elem
        newTab = true

    if multiMode
      setCurrentKeys ''
      CmdBox.set title: title()
    else
      setTimeout @remove, 200
