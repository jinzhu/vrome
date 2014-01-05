Debug = (str) ->
  try
    # Format TypeError
    if typeof str is 'object' and str.hasOwnProperty('stack') and str.hasOwnProperty 'message'
      str = "#{str.message}\n\n#{str.stack}"
    # Format Function
    str = str.toString() if $.isFunction str
    console.log str

    Post action: 'Debug', message: str
  catch err
    console.log err

root = exports ? window
root.Debug = Debug
