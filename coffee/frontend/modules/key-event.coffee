class KeyEvent
  [disableVrome, passNextKey, currentKeys, keyTimes, @bindings] = [null, null, "", 0, []]


  @init: =>
    for disablesite in Option.get("disablesites").split(", ")
      continue if RegExp("^\\s*$").test(disablesite)
      @disable() if new RegExp(disablesite, "i").test(location.href)

    unless document.vromeEventListenerAdded
      document.addEventListener "keydown", KeyEvent.exec, true
      document.vromeEventListenerAdded = true

  @add: (keys, func, insert_mode) => #String, #Function, #Boolean
    @bindings.push [keys, func, !!insert_mode]

  @stopPropagation: (e) ->
    e.stopPropagation()
    e.preventDefault()

  @enable: =>
    [disableVrome, passNextKey] = [false, false]
    @reset()

  @disable: ->
    CmdBox.set title: " -- PASS THROUGH -- ", mouseOverTitle: (e) -> CmdBox.remove()
    disableVrome = true

  @passNextKey: ->
    CmdBox.set title: " -- PASS THROUGH (next) -- ", timeout: 2000
    passNextKey = true
    Post action: "Vrome.disable"

  @reset: ->
    CmdBox.remove()
    [currentKeys, times] = ["", 0]

  @times: (only_read) -> #Boolean
    result = keyTimes
    keyTimes = 0 unless only_read
    result


  storeLast = (currentKeys, times) -> #Array, #Number
    Settings.add currentKeys: currentKeys, times: times ? 0

  @runLast: ->
    runCurrentKeys Settings.get("@currentKeys")


  filterKey = (key, insertMode) ->
    configure = Settings.get("@configure")
    mode = (if insertMode then "imap" else "map")
    return key if /^\d$/.test(key)
    configure?[mode]?[key] or key

  ignoreKey = (key, insertMode) ->
    configure = Settings.get("@configure")
    mode = (if insertMode then "iunmap" else "unmap")
    configure?[mode]?[key]?

  runCurrentKeys = (keys, insertMode, e) =>
    return unless keys
    [key, last_times] = [(if e then getKey(e) else null), null]

    # when run last command, fix run time.
    if key is "." and not insertMode
      last_times = Settings.get("@times")
      keyTimes = (last_times or 1) * (times or 1)
    else
      last_times = keyTimes

    for binding in @bindings
      # 0 is a special command. could be used to scroll left, also could be used as run count.
      break if keyTimes > 0 and keys.match(/^\d$/)
      [binding_command, binding_function, binding_mode] = binding
      continue if !!insertMode isnt binding_mode # insert mode match or not

      escaped_command = binding_command.replace(/([(\[{\\^$|)?*+.])/g, "\\$1") # "[[" -> "\\[\\["
      regexp = new RegExp("^(\\d*)(#{escaped_command})$")

      # Run matched functions
      if regexp.test(keys)
        someFunctionCalled = true
        keys.replace regexp, ""

        # map j 3j
        map_times = Number(RegExp.$1)
        keyTimes = map_times * (keyTimes or 1)  if map_times > 0

        try
          binding_function.call e
        catch err
          Debug err

        keyTimes = last_times  if map_times > 0

      # Check if there are any bindings matched
      regexp = new RegExp("^(#{keys.replace(/([(\[{\\^$|)?*+.])/g, "\\$1")})")
      someBindingMatched = true if regexp.test(binding_command)


    showStatusLine currentKeys, keyTimes if someBindingMatched and not someFunctionCalled
    # If any function invoked, then store it to last run command.
    # (Don't do this when run repeat last command or In InsertMode)
    storeLast keys, keyTimes  if someFunctionCalled and e and (key isnt ".") and not insertMode

    # Reset currentKeys if nothing match or some function called
    currentKeys = ""  if not someBindingMatched or someFunctionCalled

    # Set the count time
    keyTimes = (keyTimes or 0) * 10 + Number(key)  if not someFunctionCalled and not insertMode and /^\d$/.test(key)

    # If some function invoked and a key pressed, reset the count
    # but don't reset it if no key pressed, this should means the function is invoked by runLastCommand.
    keyTimes = 0  if someFunctionCalled and key

    # stopPropagation if Vrome is enabled and any functions executed but not in InsertMode or on a link
    if e and someFunctionCalled and not (disableVrome or passNextKey)
      @stopPropagation e  unless isAcceptKey(key) and (insertMode or document.activeElement.nodeName is "A")
    # Compatible with google's new interface
    if e and key?.match(/^.$/) and (not insertMode)
      @stopPropagation e

  showStatusLine = (currentKeys, times) ->
    if Option.get("showstatus") and currentKeys
      CmdBox.set title: "#{times || ""}#{currentKeys}", timeout: 500


  @exec: (e) =>
    key = getKey(e)
    insertMode = (/^INPUT|TEXTAREA|SELECT$/i.test(e.target.nodeName) or e.target.getAttribute("contenteditable")?)

    return @stopPropagation e if /^(Control|Alt|Shift)$/.test(key)
    # if vrome is in pass next mode, or disabled and using <C-Esc> to enable it.
    return @enable() if not insertMode and (passNextKey or (disableVrome and isCtrlEscapeKey(key)))

    currentKeys = filterKey(currentKeys.concat(key), insertMode)
    return if ignoreKey(currentKeys, insertMode)

    runCurrentKeys currentKeys, insertMode, e


root = exports ? window
root.KeyEvent = KeyEvent
