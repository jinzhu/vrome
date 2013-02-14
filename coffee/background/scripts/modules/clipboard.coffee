class Clipboard
  createTextArea = (data) ->
    text_node = $("<textarea>").val(data)
    $('body').append text_node
    text_node

  @copy: (msg) ->
    text_node = createTextArea(msg.value)
    text_node.select()
    document.execCommand "Copy"
    $(text_node).remove()

  @read: (msg) ->
    text_node = createTextArea("")
    text_node.select()
    document.execCommand "paste"
    result = $(text_node).val()
    $(text_node).remove()
    result


root = exports ? window
root.Clipboard = Clipboard
