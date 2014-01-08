class Clipboard
  createTextArea = (data) ->
    textNode = $('<textarea>').val(data)
    $('body').append textNode
    textNode

  @copy: (msg) ->
    textNode = createTextArea(msg.value)
    textNode.select()
    document.execCommand 'Copy'
    $(textNode).remove()

  @read: (msg) ->
    textNode = createTextArea ''
    textNode.select()
    document.execCommand 'paste'
    result = $(textNode).val()
    $(textNode).remove()
    result

root = exports ? window
root.Clipboard = Clipboard
