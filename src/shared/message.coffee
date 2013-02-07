chrome.extension.onMessage.addListener (msg, sender, sendResponse) ->
  
  # Get Function
  actions = msg.action.split(".")
  action = window[actions.shift()]
  action = action[actions.shift()]  while action and actions[0]
  
  # Get Argument
  argument = (if (typeof msg.arguments isnt "undefined") then msg.arguments else msg)
  argument = (if (argument instanceof Array) then argument else [argument])
  
  # Run Function & Pass Tab to it
  tab = sender.tab
  tab.sendResponse = sendResponse
  argument.push tab
  action.apply "", argument  if action instanceof Function

