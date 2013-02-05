Debug = (str) ->
  console.log str
debug = (msg) ->
  tab = arguments_[arguments_.length - 1]
  Debug tab.url + " : \n" + msg.message
vv = (msg) ->
  chrome.tabs.query
    active: true
  , (tabs) ->
    _.each tabs, (tab) ->
      Post tab,
        action: "D.log"
        m: msg



