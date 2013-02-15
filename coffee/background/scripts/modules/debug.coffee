Debug = (str) ->
  try
    # Format Frontend Error
    str = str['message'] if $.isPlainObject(str) and str['message']

    # Format TypeError
    if (typeof(str) == 'object') and str.hasOwnProperty('stack') and str.hasOwnProperty('message')
      str = "#{str.message}\n\n#{str.stack}"

    # Format Function
    str = str.toString() if $.isFunction str

    runScript {code: "console.log(\"#{str.replace(/\"/g, '\\"')}\")"}, Tab.now_tab if Tab.now_tab
    # Post(Tab.now_tab, {action: 'console.log', arguments: str}) if Tab.now_tab

    $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: str})
    $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: str})
  catch err
    console.log err


root = exports ? window
root.Debug = Debug
