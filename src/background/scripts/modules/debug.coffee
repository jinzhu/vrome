Debug = (str) ->
  str = str['message'] if $.isPlainObject(str) and str['message']
  str = str.toString() if $.isFunction str
  $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: str})


root = exports ? window
root.Debug = Debug
