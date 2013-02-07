Search = (->
  kill_find = ->
    if findTimeoutID
      clearTimeout findTimeoutID
      findTimeoutID = `undefined`
  find = (keyword) ->
    do_find = (keyword, node) ->
      processedNodes = 0
      loop
        node = node.firstChild  while node.hasChildNodes() and node.id isnt "_vrome_cmd_box" and not /(script|style)/i.test(node.tagName)
        if node.nodeType is 3 # text node
          caseSensitive = /[A-Z]/.test(keyword)
          key = (if caseSensitive then keyword else keyword.toUpperCase())
          text = (if caseSensitive then node.data else node.data.toUpperCase())
          index = text.indexOf(key)
          unless index is -1
            processedNodes++
            parentNode = node.parentNode
            unless parentNode.className is highlight_class
              nodeData = node.data
              before = document.createTextNode(nodeData.substr(0, index))
              match = document.createTextNode(nodeData.substr(index, keyword.length))
              after = document.createTextNode(nodeData.substr(index + keyword.length))
              span = document.createElement("span")
              span.setAttribute "class", highlight_class
              span.appendChild match
              parentNode.insertBefore before, node
              parentNode.insertBefore span, node
              parentNode.insertBefore after, node
              parentNode.removeChild node
              node = span
        until node.nextSibling
          node = node.parentNode
          if node is document.body
            findTimeoutID = `undefined`
            return
        node = node.nextSibling
        if processedNodes > 100
          findTimeoutID = setTimeout(do_find, 25, keyword, node)
          return
    return  unless keyword
    kill_find()
    findTimeoutID = setTimeout(do_find, 25, keyword, document.body)
  remove = ->
    kill_find()
    nodes = document.getElementsByClassName(highlight_class)
    total_length = nodes.length
    from_length = total_length
    if from_length > 100
      from_length = 100
      setTimeout remove, 25
    i = from_length

    while i >= 0
      if nodes[i]
        parentNode = nodes[i].parentNode
        text = nodes[i].innerText
        prevNode = nodes[i].previousSibling
        if prevNode.nodeType is 3
          text = prevNode.data + text
          parentNode.removeChild prevNode
        nextNode = nodes[i].nextSibling
        if nextNode.nodeType is 3
          text = text + nextNode.data
          parentNode.removeChild nextNode
        textNode = document.createTextNode(text)
        parentNode.replaceChild textNode, nodes[i]
      i--
    parseInt(total_length / 100) * 25 + 5
  next = (step, totally_steps) ->
    return  unless searchMode
    totally_steps = totally_steps or 0
    offset = direction * step * times()
    nodes = document.getElementsByClassName(highlight_class)
    return false  if nodes.length is 0
    i = 0

    while i < nodes.length
      if nodes[i].id is highlight_current_id
        nodes[i].removeAttribute "id"
        break
      i++
    
    # TODO refact me!
    i = (i + offset) % nodes.length
    i += nodes.length  if i < 0
    CmdBox.blur()
    if nodes[i] and isElementVisible(nodes[i], true) # In full page
      nodes[i].setAttribute "id", highlight_current_id
      nodes[i].scrollIntoViewIfNeeded()
    else setTimeout next, 5, step, totally_steps + step  if totally_steps < nodes.length
  handleInput = (e) ->
    wait_time = 0
    return  unless searchMode
    wait_time = remove()  unless isAcceptKey(getKey(e))
    setTimeout find, wait_time, CmdBox.get().content
    lastSearch = CmdBox.get().content
  start = (backward) ->
    searchMode = true
    direction = (if backward then -1 else 1)
    CmdBox.set
      title: (if backward then "Backward search: ?" else "Forward search: /")
      pressUp: handleInput
      content: getSelected() or lastSearch or ""

  stop = ->
    return  unless searchMode
    searchMode = false
    remove()
  useSelectedValueAsKeyword = ->
    lastSearch = getSelected()
    lastSearch
  openCurrent = (new_tab) ->
    return  unless searchMode
    elem = document.getElementById(highlight_current_id)
    options = {}
    options[(if Platform.mac then "meta" else "ctrl")] = new_tab
    clickElement elem, options
  searchMode = undefined
  direction = undefined
  lastSearch = undefined
  findTimeoutID = undefined
  highlight_class = "__vrome_search_highlight"
  highlight_current_id = "__vrome_search_highlight_current"
  start: start
  stop: stop
  backward: ->
    start true

  prev: ->
    next -1

  next: ->
    next 1

  forwardCursor: ->
    start()  if useSelectedValueAsKeyword()

  backwardCursor: ->
    start true  if useSelectedValueAsKeyword()

  openCurrent: ->
    openCurrent false

  openCurrentNewTab: ->
    openCurrent true
)()
