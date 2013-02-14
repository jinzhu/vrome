Debug = (str) ->
  # Format TypeError
  if (typeof(str) == 'object') and str.hasOwnProperty('stack') and str.hasOwnProperty('message')
    str = "#{str.message}\n\n#{str.stack}"
  # Format Function
  str = str.toString() if $.isFunction str

  Post action: "Debug", message: str


root = exports ? window
root.Debug = Debug
