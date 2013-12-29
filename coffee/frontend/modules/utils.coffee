root = exports ? window

root.Platform = {
  linux: navigator.userAgent.indexOf("Linux") isnt -1
  mac: navigator.userAgent.indexOf("Mac") isnt -1
  win: navigator.userAgent.indexOf("Windows") isnt -1
}

root.getSelected = -> window.getSelection().toString()

root.times = (raw, read) ->
  if raw then KeyEvent.times(read) else (KeyEvent.times(read) or 1)


root.isElementVisible = (elem, in_full_page) ->
  return false unless $(elem).is(':visible')
  style = window.getComputedStyle($(elem).get(0))
  return false if (style.getPropertyValue('visibility') != 'visible' || style.getPropertyValue('display') == 'none' || style.getPropertyValue('opacity') == '0')
  return true if in_full_page

  [winTop, winLeft] = [$(window).scrollTop(), $(window).scrollLeft()]
  winBottom = winTop + window.innerHeight
  winRight = winLeft + $(window).width()

  offset = $(elem).offset()
  [elemTop, elemLeft] = [offset.top, offset.left]
  elemBottom = elemTop + $(elem).height()
  elemRight = elemLeft + $(elem).width()

  (elemBottom >= winTop) and (elemTop <= winBottom) and (elemLeft <= winRight) and (elemRight >= winLeft)


root.clickElement = (elem, opt={}) ->
  #event.initMouseEvent(type, canBubble, cancelable, view,
  #                     detail, screenX, screenY, clientX, clientY,
  #                     ctrlKey, altKey, shiftKey, metaKey,
  #                     button, relatedTarget);
  # https://developer.mozilla.org/en/DOM/event.initMouseEvent

  opt["meta"] = opt["ctrl"] if Platform.mac

  if elem.length # If defined method length, then we thought it as Array
    clickElement(e, opt) for e in elem
    return

  old_target = null
  if opt["meta"] or opt["ctrl"] # open in new tab
    opt["shift"] = Option.get("follow_new_tab") is 1
  else
    old_target = elem.getAttribute("target")
    elem.removeAttribute "target"

  for event_type in ["mousedown", "mouseup", "click"]
    event = document.createEvent("MouseEvents")
    event.initMouseEvent event_type, true, true, window, 0, 0, 0, 0, 0, !!opt.ctrl, !!opt.alt, !!opt.shift, !!opt.meta, 0, null
    elem.dispatchEvent event

  # FIXME ctrl = false can't open url in current page
  # if (!!opt.ctrl is false) and $(elem).attr("href")?.match(/:\/\//)
  #   Post action: "Tab.openUrl", url: $(elem).attr("href"), newtab: false

  elem.setAttribute "target", old_target  if old_target
