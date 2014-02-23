class window.Clipboard
  createTextArea = (data) ->
    textNode = $('<textarea>').val(data)
    $(document.documentElement).append textNode
    textNode

  @copy: (msg) ->
    textNode = createTextArea msg.value
    textNode.select()
    document.execCommand 'Copy'
    $(textNode).remove()

  @read: ->
    textNode = createTextArea ''
    textNode.select()
    document.execCommand 'paste'
    $textNode = $(textNode)
    result = $textNode.val()
    $textNode.remove()
    result
