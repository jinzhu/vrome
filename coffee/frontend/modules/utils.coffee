root = exports ? window

root.Platform = {
  linux: navigator.userAgent.indexOf('Linux')   isnt -1
  mac:   navigator.userAgent.indexOf('Mac')     isnt -1
  win:   navigator.userAgent.indexOf('Windows') isnt -1
}

root.getSelected = -> window.getSelection().toString()

root.times = (raw, read) ->
  if raw then KeyEvent.times read else (KeyEvent.times(read) or 1)

root.isElementVisible = (elem, inFullPage) ->
  return false unless elem.is ':visible'
  style = window.getComputedStyle elem.get(0)
  return false if \
    style.getPropertyValue('visibility') isnt 'visible' or
    style.getPropertyValue('display') is 'none' or
    style.getPropertyValue('opacity') is '0'
  return true if inFullPage

  $window = $(window)
  [winTop, winLeft] = [$window.scrollTop(), $window.scrollLeft()]
  winBottom = winTop + window.innerHeight
  winRight  = winLeft + $window.width()

  offset     = elem.offset()
  elemBottom = offset.top + elem.height()
  elemRight  = offset.left + elem.width()

  elemBottom >= winTop and offset.top <= winBottom and offset.left <= winRight and elemRight >= winLeft

root.clickElement = (elem, opt={}) ->
  #event.initMouseEvent(type, canBubble, cancelable, view,
  #                     detail, screenX, screenY, clientX, clientY,
  #                     ctrlKey, altKey, shiftKey, metaKey,
  #                     button, relatedTarget);
  # https://developer.mozilla.org/en/DOM/event.initMouseEvent

  opt.meta = opt.ctrl if Platform.mac

  if elem.length # If defined method length, then we thought it as Array
    clickElement e, opt for e in elem
    return

  oldTarget = null
  if opt.meta or opt.ctrl # open in new tab
    opt.shift = Option.get('follow_new_tab') is 1
  else
    oldTarget = elem.getAttribute 'target'
    elem.removeAttribute 'target'

  for eventType in ['mousedown', 'mouseup', 'click']
    event = document.createEvent 'MouseEvents'
    event.initMouseEvent eventType, true, true, window, 0, 0, 0, 0, 0, (opt.ctrl ? false),
      (opt.alt ? false), (opt.shift ? false), (opt.meta ? false), 0, null
    elem.dispatchEvent event

  # FIXME ctrl = false can't open url in current page
  # if (!!opt.ctrl is false) and $(elem).attr("href")?.match(/:\/\//)
  #   Post action: "Tab.openUrl", url: $(elem).attr("href"), newTab: false

  elem.setAttribute 'target', oldTarget if oldTarget
