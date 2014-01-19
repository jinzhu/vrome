chrome.runtime.onMessage.addListener (msg, sender, sendResponse) ->
  # Get function
  func = (func ? window)[action] for action in msg.action.split '.'

  # Run function and pass tab to it
  msg.tab = sender.tab
  func msg if $.isFunction func
