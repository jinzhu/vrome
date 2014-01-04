chrome.runtime.onMessage.addListener (msg, sender, sendResponse) ->

  # Get function
  func = (func ? window)[action] for action in msg.action.split '.'

  # Run function and pass tab to it
  tab = sender.tab
  tab.sendResponse = sendResponse if tab
  msg.tab = tab
  func msg if func instanceof Function
