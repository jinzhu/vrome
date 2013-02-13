Debug = (str) ->
  str = str.toString() if $.isFunction str
  Post action: "Debug", message: str


root = exports ? window
root.Debug = Debug
