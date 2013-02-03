chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  // Get Function
  var actions = msg.action.split('.');
  var action = window[actions.shift()];
  while (action && actions[0]) { action = action[actions.shift()]; }

  // Get Argument
  var argument = (typeof msg.arguments != 'undefined') ? msg.arguments : msg;
  argument     = (argument instanceof Array) ? argument : [argument];

  // Run Function & Pass Tab to it
  var tab = sender.tab;
  tab.sendResponse = sendResponse;
  argument.push(tab);
  if (action instanceof Function) action.apply('', argument);
});
