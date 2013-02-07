KeyEvent = (->
  init = ->
    
    # disabled sites
    disable_sites = Option.get("disablesites").split(", ")
    i = 0

    while i < disable_sites.length
      if disable_sites[i] and new RegExp(disable_sites[i], "i").test(location.href)
        disable()
        break
      i++
    unless document.vromeEventListenerAdded
      document.addEventListener "keydown", KeyEvent.exec, true
      document.vromeEventListenerAdded = true
  getTimes = (only_read) -> #Boolean
    origin_times = times
    times = 0  unless only_read
    # reset count it if used.
    origin_times
  
  #/////////////////////////////////////////////////
  # Last Commands
  #/////////////////////////////////////////////////
  storeLast = (currentKeys, times) -> #Array
#Number
    times = times or 0
    Settings.add "background.currentKeys", currentKeys
    Settings.add "background.times", times
    Post
      action: "storeLastCommand"
      currentKeys: currentKeys
      times: times

  runLast = ->
    runCurrentKeys Settings.get("background.currentKeys")
  
  #/////////////////////////////////////////////////
  add = (keys, func, insert_mode) -> #String
#Function
#Boolean
    bindings.push [keys, func, !!insert_mode]
  doneDefiningCoreBindings = ->
    KeyEvent.coreBindingsIndex = bindings.length
  reset = ->
    currentKeys = ""
    times = 0
  
  #/////////////////////////////////////////////////
  passNextKey = ->
    CmdBox.set
      title: " -- PASS THROUGH (next) -- "
      timeout: 2000

    pass_next_key = true
    Post action: "Vrome.disable"
  disable = ->
    CmdBox.set
      title: " -- PASS THROUGH -- "
      mouseOverTitle: (e) ->
        CmdBox.remove()

    disableVrome = true
  enable = ->
    CmdBox.remove()
    disableVrome = false
    pass_next_key = false
    reset()
  
  #/////////////////////////////////////////////////
  filterKey = (key, insertMode) ->
    configure = Settings.get("background.configure")
    mode = (if insertMode then "imap" else "map")
    return key  if /^\d$/.test(key)
    window.bindings = bindings
    (configure[mode] and configure[mode][key]) or key
  ignoreKey = (key, insertMode) ->
    configure = Settings.get("background.configure")
    mode = (if insertMode then "iunmap" else "unmap")
    return true  if configure[mode] and configure[mode][key]
    false
  runCurrentKeys = (keys, insertMode, e) ->
    return  unless keys
    key = null
    last_times = null
    key = getKey(e)  if e
    
    # when run last command, fix run time.
    if key is "." and not insertMode
      last_times = Settings.get("background.times")
      times = (last_times or 1) * (times or 1)
    else
      last_times = times
    i = 0

    while i < bindings.length
      
      # 0 is a special command. could be used to scroll left, also could be used as run count.
      break  if times > 0 and keys.match(/^\d$/)
      binding = bindings[i]
      binding_command = binding[0]
      binding_function = binding[1]
      binding_mode = binding[2] # insert mode or not
      escaped_command = binding_command.replace(/([(\[{\\^$|)?*+.])/g, "\\$1") # "[[" -> "\\[\\["
      # insertMode match?
      continue  unless !!insertMode is binding_mode
      regexp = new RegExp("^(\\d*)(" + escaped_command + ")$")
      if regexp.test(keys)
        removeStatusLine()
        someFunctionCalled = true
        keys.replace regexp, ""
        
        # map j 3j
        map_times = Number(RegExp.$1)
        times = map_times * (times or 1)  if map_times > 0
        try
          binding_function.call e
        catch err
          logError err
        times = last_times  if map_times > 0
      regexp = new RegExp("^(" + keys.replace(/([(\[{\\^$|)?*+.])/g, "\\$1") + ")")
      someBindingMatched = true  if regexp.test(binding_command)
      i++
    
    # TODO Refact me
    if (someBindingMatched is `undefined`) and not keys.match(/^\d$/)
      configure = Settings.get("background.configure")
      mode = (if insertMode then "imap" else "map")
      if configure[mode]
        for i of configure[mode]
          regexp = new RegExp("^(" + keys.replace(/([(\[{\\^$|)?*+.])/g, "\\$1") + ")")
          someBindingMatched = true  if regexp.test(i)
    
    # hide status line if no binding matched && no function called
    removeStatusLine()  if not someBindingMatched and not someFunctionCalled
    
    # If any function invoked, then store it to last run command.
    # (Don't do this when run repeat last command or In InsertMode)
    storeLast keys, times  if someFunctionCalled and e and key isnt "." and not insertMode
    
    # Reset currentKeys if nothing match or some function called
    currentKeys = ""  if not someBindingMatched or someFunctionCalled
    
    # Set the count time.
    times = (times or 0) * 10 + Number(key)  if not someFunctionCalled and not insertMode and /^\d$/.test(key)
    
    # If some function invoked and a key pressed, reset the count
    # but don't reset it if no key pressed, this should means the function is invoked by runLastCommand.
    times = 0  if someFunctionCalled and key
    
    # if Vrome is enabled and any functions executed.
    
    # skip press Enter in insertMode (used to submit form)
    # or when focus is on a link
    stopPropagation e  unless isAcceptKey(key) and (insertMode or document.activeElement.nodeName is "A")  if e and someFunctionCalled and not disableVrome and not pass_next_key
    
    # Compatible with google's new interface
    stopPropagation e  if key and key.match(/^.$/) and not insertMode and not (/^\d$/.test(key) and Option.get("allow_numeric"))
  stopPropagation = (e) ->
    e.stopPropagation()
    e.preventDefault()
  exec = (e) ->
    key = getKey(e)
    insertMode = (/^INPUT|TEXTAREA|SELECT$/i.test(e.target.nodeName) or e.target.getAttribute("contenteditable")?)
    if /^(Control|Alt|Shift)$/.test(key)
      stopPropagation e
      return
    currentKeys += key
    
    # if vrome set disabled or pass the next, use <C-Esc> to enable it.
    if (pass_next_key or disableVrome) and not insertMode
      enable()  if pass_next_key or isCtrlEscapeKey(key)
      return
    currentKeys = filterKey(currentKeys, insertMode) #FIXME multi modes
    showStatusLine currentKeys
    if ignoreKey(currentKeys, insertMode)
      
      # stop the propagation of commands that start by an unmapped key e.g unmap `t` BUT user adds commands like `tcc`, `tce` and when typing `t`, it will be ignored
      # e.g http://oscarotero.com/jquery/ where the page grabs the focus whenever we type something that doesn't match a command'
      currentKeysBindings = getBindingsStartingBy(currentKeys, insertMode)
      stopPropagation e  if currentKeysBindings.length > 1
      return
    runCurrentKeys currentKeys, insertMode, e
  getBindingsStartingBy = (currentKeys, insertMode) ->
    _.filter bindings, (v) ->
      v[0].startsWith(currentKeys) and v[2] is insertMode

  removeStatusLine = ->
    CmdBox.remove()  if Option.get("showstatus") and not CmdBox.isActive()
  showStatusLine = (currentKeys) ->
    if Option.get("showstatus") and not CmdBox.isActive()
      tmp = getTimes(true) or ""
      CmdBox.set title: tmp + currentKeys
  times = 0
  disableVrome = undefined
  pass_next_key = undefined
  bindings = []
  currentKeys = ""
  add: add
  exec: exec
  reset: reset
  enable: enable
  init: init
  times: getTimes
  disable: disable
  passNextKey: passNextKey
  runLast: runLast
  stopPropagation: stopPropagation
  bindings: bindings
  done: doneDefiningCoreBindings
)()

# store index of last defined bindings from vrome -- the bindings after that index are from the user using custom JS
KeyEvent.coreBindingsIndex = 0
