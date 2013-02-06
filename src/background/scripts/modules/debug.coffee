Debug = (str) ->
  console.log str
  $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: str})


root = exports ? window
root.Debug = Debug
