class window.KeyEvent
  [disableVrome, passNextKey, currentKeys, keyTimes, bindings] = [false, false, '', 0, {}]

  @init: =>
    for disabledSite in Option.get('disablesites').split(',') when disabledSite isnt ''
      @disable() if new RegExp(disabledSite, 'i').test(location.href)

    document.addEventListener 'keydown', KeyEvent.exec, true

  @add: (keys, func, insertMode) ->
    bindings[keys] ?= [null, null]
    bindings[keys][Number insertMode] = func

  @stopPropagation: (e) ->
    e.stopPropagation()
    e.preventDefault()

  @enable: =>
    [disableVrome, passNextKey] = [false, false]
    Post action: 'Vrome.enable'
    @reset()

  @disable: ->
    if Option.get 'show_disabled_text'
      CmdBox.set title: ' -- PASS THROUGH -- ', mouseOverTitle: CmdBox.remove
    disableVrome = true
    Post action: 'Vrome.disable'
  desc @disable, 'Disable Vrome'
  @disable.options =
    disablesites:
      description: "Disable Vrome in those sites. Multiple URLs can be separated with ','"
      example:     'set disablesites=mail.google.com,reader.google.com'
    enable_vrome_key:
      description: 'Key to enable Vrome again'
      example:     'set enable_vrome_key=<Esc>'
    show_disabled_text:
      description: 'Show Vrome Disabled text or not. You could also know this from the Action Icon'
      example:     'set show_disable_text=0'

  @passNextKey: ->
    CmdBox.set title: ' -- PASS THROUGH (next) -- ', timeout: 2000 if Option.get 'show_disabled_text'
    passNextKey = true
    Post action: 'Vrome.disable'
  desc @passNextKey, 'Pass next key'

  @reset: ->
    CmdBox.remove()
    [currentKeys, times] = ['', 0]

  @times: (onlyRead) ->
    result = keyTimes
    keyTimes = 0 unless onlyRead
    result

  storeLast = (currentKeys, times=0) ->
    Settings.add { currentKeys, times }

  @runLast: ->
    runCurrentKeys Settings.get('@currentKeys'), false
  desc @runLast, 'Repeat the last command'

  filterKey = (key, insertMode) ->
    configure = Settings.get '@configure'
    mode = if insertMode then 'imap' else 'map'
    return key if /^\d$/.test key
    configure?[mode]?[key] or key

  ignoreKey = (key, insertMode) ->
    configure = Settings.get '@configure'
    mode = if insertMode then 'iunmap' else 'unmap'
    configure?[mode]?[key]?

  showStatusLine = ->
    if Option.get 'showstatus'
      CmdBox.set title: "#{keyTimes or ''}#{currentKeys}", timeout: 500

  runCurrentKeys = (keys, insertMode, e) =>
    return unless keys
    key = if e then getKey e else null

    # when run last command, fix run time.
    if key is '.' and not insertMode
      lastTimes = Settings.get '@times'
      keyTimes = (lastTimes or 1) * (keyTimes or 1)
    else
      lastTimes = keyTimes

    # 0 is a special command: could be used to scroll left, also could be used as run count.
    if keyTimes <= 0 or not /^\d$/.test keys
      /^(\d*)(.+)$/.test keys
      count = RegExp.$1
      match = RegExp.$2

      bindingFunction = bindings[match]?[Number insertMode]
      if bindingFunction?
        # Run matched function

        # map j 3j
        mapTimes = Number count
        keyTimes = mapTimes * (keyTimes or 1) if mapTimes > 0

        try
          bindingFunction.call e
        catch error
          Debug error

        keyTimes = lastTimes if mapTimes > 0

        if e
          # If any function invoked, then store it to last run command.
          # (don't do this when running 'repeat last command' or in InsertMode)
          storeLast keys, keyTimes if key isnt '.' and not insertMode

          # stopPropagation if Vrome is enabled and any functions executed
          @stopPropagation e

          # If some function invoked and a key pressed, reset the count
          # but don't reset it if no key pressed, this means the function is invoked by runLast.
          keyTimes = 0

        currentKeys = ''
      else
        # Check if there are any bindings that match
        for command, modes of bindings when modes[Number insertMode]? and command.startsWith keys
          someBindingMatched = true
          do showStatusLine
          break

        currentKeys = '' if not someBindingMatched

        # Set the count time
        if not insertMode and /^\d$/.test key
          keyTimes = keyTimes * 10 + Number(key)
          do showStatusLine

  @exec: (e) =>
    key = getKey e
    insertMode = e.target.nodeName in ['INPUT', 'TEXTAREA', 'SELECT'] or e.target.getAttribute('contenteditable')?

    # If Vrome in pass-next or disabled mode and using <C-Esc> to enable it.
    return @enable() if not insertMode and (passNextKey or (disableVrome and isCtrlEscapeKey(key)))
    return @stopPropagation e if key in ['Control', 'Alt', 'Shift']
    return if disableVrome

    currentKeys = filterKey currentKeys.concat(key), insertMode
    return if ignoreKey currentKeys, insertMode

    runCurrentKeys currentKeys, insertMode, e
