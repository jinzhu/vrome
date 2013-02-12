class KeyEvent
  [key_times, disableVrome, pass_next_key, @bindings, currentKeys] = [0, null, null, [], ""]


  @add: (keys, func, insert_mode) -> #String, #Function, #Boolean
    @bindings.push [keys, func, !!insert_mode]


  @init: ->
    for disablesite in Option.get("disablesites").split(", ")
      new RegExp(disable_sites[i], "i").test(location.href)
        disable()
        break

    unless document.vromeEventListenerAdded
      document.addEventListener "keydown", KeyEvent.exec, true
      document.vromeEventListenerAdded = true

  @stopPropagation: (e) ->
    e.stopPropagation()
    e.preventDefault()

  @enable: ->
    CmdBox.remove()
    [disableVrome, pass_next_key] = [false, false]
    reset()

  @passNextKey: ->
    CmdBox.set title: " -- PASS THROUGH (next) -- ", timeout: 2000
    pass_next_key = true
    Post action: "Vrome.disable"

  @disable: ->
    CmdBox.set title: " -- PASS THROUGH -- ", mouseOverTitle: (e) -> CmdBox.remove()
    disableVrome = true

  @reset: ->
    [currentKeys, times] = ["", 0]


  @times: (only_read) -> #Boolean
    result = key_times
    key_times = 0 unless only_read
    result


  storeLast = (currentKeys, times) -> #Array, #Number
    Settings.add "background.currentKeys", currentKeys
    Settings.add "background.times", times ? 0
    Post action: "storeLastCommand", currentKeys: currentKeys, times: times ? 0

  @runLast: ->
    runCurrentKeys Settings.get("background.currentKeys")


  filterKey = (key, insertMode) ->
    configure = Settings.get("background.configure")
    mode = (if insertMode then "imap" else "map")
    return key if /^\d$/.test(key)
    configure[mode]?[key] or key

  ignoreKey = (key, insertMode) ->
    configure = Settings.get("background.configure")
    mode = (if insertMode then "iunmap" else "unmap")
    configure[mode]?[key]?

  runCurrentKeys = (keys, insertMode, e) =>
    return unless keys
    [key, last_times] = [(if e then getKey(e) else null), null]

    # when run last command, fix run time.
    if key is "." and not insertMode
      last_times = Settings.get("background.times")
      key_times = (last_times or 1) * (times or 1)
    else
      last_times = key_times

    for binding in bindings
      # 0 is a special command. could be used to scroll left, also could be used as run count.
      break if key_times > 0 and keys.match(/^\d$/)
      [binding_command, binding_function, binding_mode] = binding
      escaped_command = binding_command.replace(/([(\[{\\^$|)?*+.])/g, "\\$1") # "[[" -> "\\[\\["
      continue if !!insertMode isnt binding_mode # insert mode match or not

      regexp = new RegExp("^(\\d*)(#{escaped_command})$")
      # Run matched functions
      if regexp.test(keys)
        someFunctionCalled = true
        keys.replace regexp, ""

        # map j 3j
        map_times = Number(RegExp.$1)
        key_times = map_times * (key_times or 1)  if map_times > 0

        try
          binding_function.call e
        catch err
          Debug err

        key_times = last_times  if map_times > 0

      # Check if there are any bindings matched
      regexp = new RegExp("^(#{keys.replace(/([(\[{\\^$|)?*+.])/g, "\\$1")})")
      someBindingMatched = true if regexp.test(binding_command)


    # hide status line if some function called or no binding matched
    removeStatusLine() if someFunctionCalled or !someBindingMatched

    # If any function invoked, then store it to last run command.
    # (Don't do this when run repeat last command or In InsertMode)
    storeLast keys, key_times  if someFunctionCalled and e and (key isnt ".") and not insertMode

    # Reset currentKeys if nothing match or some function called
    currentKeys = ""  if not someBindingMatched or someFunctionCalled

    # Set the count time
    key_times = (key_times or 0) * 10 + Number(key)  if not someFunctionCalled and not insertMode and /^\d$/.test(key)

    # If some function invoked and a key pressed, reset the count
    # but don't reset it if no key pressed, this should means the function is invoked by runLastCommand.
    key_times = 0  if someFunctionCalled and key

    # if Vrome is enabled and any functions executed.

    # skip press Enter in insertMode (used to submit form)
    # or when focus is on a link
    if e and someFunctionCalled and not disableVrome and not pass_next_key
      @stopPropagation e  unless isAcceptKey(key) and (insertMode or document.activeElement.nodeName is "A")
      # Compatible with google's new interface
      if key and key.match(/^.$/) and not insertMode and not (/^\d$/.test(key) and Option.get("allow_numeric"))
        @stopPropagation e

  removeStatusLine = ->
    CmdBox.remove() unless CmdBox.isActive()

  showStatusLine = (currentKeys) ->
    if Option.get("showstatus") and not CmdBox.isActive()
      CmdBox.set title: "#{@times(true) ? ""}#{currentKeys}"


  @exec: (e) =>
    key = getKey(e)
    insertMode = (/^INPUT|TEXTAREA|SELECT$/i.test(e.target.nodeName) or e.target.getAttribute("contenteditable")?)

    return stopPropagation e if /^(Control|Alt|Shift)$/.test(key)
    # if vrome is in pass next mode, or disabled and using <C-Esc> to enable it.
    return enable() if not insertMode and (pass_next_key or (disableVrome and isCtrlEscapeKey(key)))

    currentKeys = filterKey(currentKeys.concat(key), insertMode)
    return if ignoreKey(currentKeys, insertMode)

    showStatusLine currentKeys
    runCurrentKeys currentKeys, insertMode, e


root = exports ? window
root.KeyEvent = KeyEvent
