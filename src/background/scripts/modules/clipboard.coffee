Clipboard = (->
  createTextArea = (data) -> #String
    textNode = document.createElement("textarea")
    textNode.style.position = "fixed"
    textNode.style.left = "-1000%"
    textNode.value = data
    document.body.appendChild textNode
    textNode
  copy = (msg) ->
    textNode = createTextArea(msg.value)
    textNode.select()
    document.execCommand "Copy"
    document.body.removeChild textNode
  read = ->
    textNode = createTextArea("")
    textNode.select()
    document.execCommand "paste"
    result = textNode.value
    document.body.removeChild textNode
    result
  getContent = (msg) ->
    tab = arguments_[arguments_.length - 1]
    Post tab,
      action: msg.redirect
      data: Clipboard.read()

  copy: copy
  read: read
  getContent: getContent
)()
