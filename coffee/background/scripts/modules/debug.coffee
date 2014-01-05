Debug = (str) ->
  # Format Frontend Error
  str = str.message if $.isPlainObject(str) and str.message

  # Format TypeError
  if typeof str is 'object' and str.hasOwnProperty('stack') and str.hasOwnProperty 'message'
    str = "#{str.message}\n\n#{str.stack}"

  # Format Function
  str = str.toString() if $.isFunction str

  # Post(Tab.currentTab, {action: 'console.log', arguments: str}) if Tab.currentTab

  params = JSON.stringify
    method:   'print_messages'
    messages: str
  $.post getLocalServerUrl(), params

  try
    runScript code: "console.log(\"#{str.replace(/\"/g, '\\"')}\")", Tab.currentTab if Tab.currentTab
  catch error
    console.log error

root = exports ? window
root.Debug = Debug
