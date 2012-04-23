function Debug(str) {
  console.log(str);
}

function debug(msg) {
  var tab = arguments[arguments.length - 1];
  Debug(tab.url + " : \n" + msg.message);
}

function vv(msg) {
  chrome.tabs.query({
    active: true
  }, function(tabs) {
    _.each(tabs, function(tab) {
      Post(tab, {
        action: "D.log",
        m: msg
      });
    })
  })
}
