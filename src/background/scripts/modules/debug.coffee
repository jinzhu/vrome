Debug = (str) ->
  str = str['message'] if $.isPlainObject(str) and str['message']
  $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: str})


root = exports ? window
root.Debug = Debug
