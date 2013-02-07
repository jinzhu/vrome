#Boolean
#Boolean
isElementVisible = (elem, in_full_page) -> # Boolean
  win_top = window.scrollY / Zoom.current()
  win_bottom = win_top + window.innerHeight
  win_left = window.scrollX / Zoom.current()
  win_right = win_left + window.innerWidth
  pos = elem.getBoundingClientRect()
  elem_top = win_top + pos.top
  elem_bottom = win_top + pos.bottom
  elem_left = win_left + pos.left
  elem_right = win_left + pos.left
  in_current_screen = elem_bottom >= win_top and elem_top <= win_bottom and elem_left <= win_right and elem_right >= win_left
  visible_in_screen = (pos.height isnt 0 and pos.width isnt 0) or (elem.children.length > 0)
  if in_full_page
    visible_in_screen and isDomElementVisible(elem)
  else
    in_current_screen and visible_in_screen and isDomElementVisible(elem)
isDomElementVisible = (obj) ->
  return true  if obj is document
  return false  unless obj
  return false  unless obj.parentNode
  return false  if obj.style.display is "none" or obj.style.visibility is "hidden"  if obj.style
  
  #Try the computed style in a standard way
  style = null
  if window.getComputedStyle
    style = window.getComputedStyle(obj, "")
    return false  if style.display is "none" or style.visibility is "hidden"
  
  #Or get the computed style using IE's silly proprietary way
  style = obj.currentStyle
  return false  if style and (style["display"] is "none" or style["visibility"] is "hidden")
  isDomElementVisible obj.parentNode

# attempts to do what isDomElementVisible supposed to do but limited to help box overlay for now
isHiddenByOverlay = (elem) ->
  return false  unless elem
  overlay = document.getElementById("vromeHelpOverlay")
  if overlay
    rect = elem.getBoundingClientRect()
    x = rect.left + (rect.width / 2)
    y = rect.top + (rect.height / 2)
    e = document.elementFromPoint(x, y)
    if e is elem
      return true
    else
      return false
  true

# idea to check overlay e.g when help box over shows over links, we don't display hints for links we can't access
# unfortunately document.elementFromPoint is not very reliable
# TODO: come up with a better idea. the goal is for elements with a lower z-index to not have hints
isDomElementHidden = (obj) ->
  return false  unless obj
  rect = obj.getBoundingClientRect()
  padding = 200
  x = rect.left + (rect.width / 2)
  y = rect.top + (rect.height / 2)
  elem = document.elementFromPoint(x, y)
  return false  unless elem
  return true  if elem is obj
  return true  if elem.parentNode and elem.parentNode is obj
  return true  if elem.firstChild and elem.firstChild is obj
  i = 0

  while i < elem.children.length
    return true  if elem[i] is obj
    i++
  i = 0
  while i < 10
    rectElem = elem.getBoundingClientRect()
    if rectElem.top < rect.top + padding and rectElem.left < rect.left + padding and elem.parentNode and elem isnt document.body and elem isnt document
      return true  if elem.parentNode is obj
    else
      break
    elem = elem.parentNode
    i++
  false
clickElement = (elem, opt) ->
  
  #event.initMouseEvent(type, canBubble, cancelable, view,
  #                     detail, screenX, screenY, clientX, clientY,
  #                     ctrlKey, altKey, shiftKey, metaKey,
  #                     button, relatedTarget);
  # https://developer.mozilla.org/en/DOM/event.initMouseEvent
  opt = opt or {}
  new_tab = opt["meta"] or opt["ctrl"]
  
  # Define method length, then we thought it is an Array
  if elem.length
    i = 0

    while i < elem.length
      opt["ctrl"] = true  if i > 0
      clickElement elem[i], opt
      i++
    return
  old_target = null
  unless new_tab
    old_target = elem.getAttribute("target")
    elem.removeAttribute "target"
  event = document.createEvent("MouseEvents")
  event.initMouseEvent "click", true, true, window, 0, 0, 0, 0, 0, !!opt.ctrl, !!opt.alt, !!opt.shift, !!opt.meta, 0, null
  elem.dispatchEvent event
  elem.setAttribute "target", old_target  if old_target

# accept function or array of functions
runIt = (func, args) ->
  if _.isArray(func)
    initFunction = initFunction.concat(func)
  else initFunction.push [func, args]  if _.isFunction(func)
  if document.body
    i = 0

    while i < initFunction.length
      init_function = initFunction[i]
      if init_function instanceof Function
        init_function.call()
      else if init_function[0] instanceof Function
        init_function[0].apply "", init_function[1]
      else
        Debug "RunIt(Not Run): function" + init_function
      i++
  else
    setTimeout runIt, 10
getSelected = ->
  window.getSelection().toString()

# 1.1.2
# migrates the data from the local storage to the background local storage
# necessary so we can export data + sync it across computers

# add if we don't already have data'

# delete localStorage['__vrome_setting']

#http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
extractFunction = (functionName, context) -> #, args
  args = Array::slice.call(arguments_).splice(2)
  namespaces = functionName.split(".")
  func = namespaces.pop()
  i = 0

  while i < namespaces.length
    context = context[namespaces[i]]
    i++
  context[func]
Platform =
  linux: navigator.userAgent.indexOf("Linux") isnt -1
  mac: navigator.userAgent.indexOf("Mac") isnt -1
  win: navigator.userAgent.indexOf("Windows") isnt -1

times = (raw, read) ->
  count = (if raw then KeyEvent.times(read) else (KeyEvent.times(read) or 1))
  count

Post = (msg) ->
  chrome.extension.sendMessage msg, (response) ->


initFunction = []
CustomCode = (->
  loadCSS = ->
    try
      customCSS = Settings.get("background.configure.css")
      style = document.createElement("style")
      style.innerHTML = customCSS
      document.getElementsByTagName("head")[0].appendChild style
    catch e
      console.debug "Custom CSS failed to load", e
  runJS = ->
    try
      customJS = Settings.get("configure.js")
      if customJS
        eval_ customJS
        frontendExec()  unless typeof frontendExec is "undefined"
    catch e
      console.debug "Custom JS failed to load", e
  loadCSS: loadCSS
  runJS: runJS
)()
Migration = (->
  migrateData = ->
    try
      data = JSON.parse(localStorage["__vrome_setting"] or "{}")
      if data
        not Settings.get("hosts.zoom_level") and data["zoom_level"] and Settings.add("hosts.zoom_level", data["zoom_level"])
        not Settings.get("hosts.local_marks") and data["local_marks"] and Settings.add("hosts.local_marks", data["local_marks"])
    catch e
      c.l e
  exec: migrateData
)()

# exec
#  return context[func].apply(this, args);
