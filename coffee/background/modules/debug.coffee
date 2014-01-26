window.Debug = (str) ->
  # Format Frontend Error
  str = str.message if $.isPlainObject(str) and str.message

  if typeof str is 'object' and str.hasOwnProperty 'message'
    # Format TypeError
    if str.hasOwnProperty 'stack'
      str = "#{str.message}\n#{str.stack}"
    # Format ErrorEvent
    else if str.hasOwnProperty 'lineno'
      str = "#{str.message}\n#{str.filename}:#{str.lineno}"

  # Format Function
  str = str.toString() if $.isFunction str

  # Post(Tab.currentTab, { action: 'console.log', arguments: str }) if Tab.currentTab

  params = JSON.stringify
    method:   'print_messages'
    messages: str
  $.post getLocalServerUrl(), params

  try
    if Tab.currentTab
      runScript tab: Tab.currentTab, code: "console.log(\"#{str.replace(/\"/g, '\\"')}\")"
  catch error
    console.log error
