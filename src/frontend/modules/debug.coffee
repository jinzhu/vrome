Debug = (str) ->
  Post action: "Debug", message: str


root = exports ? window
root.Debug = Debug
