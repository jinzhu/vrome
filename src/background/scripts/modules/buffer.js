var Buffer = (function() {
  function gotoFirstMatch(msg) {
    var tab = arguments[arguments.length-1],index;

    if ( /^\d+$/.test(msg.keyword) ){
      Tab.goto({ index : Number(msg.keyword) - 1 });
    } else {
      chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
        var regexp = new RegExp(msg.keyword,'i');
        for(var i = 0; i < tabs.length ;i++) {
          if (regexp.test(tabs[i].url) || regexp.test(tabs[i].title)) {
            Tab.goto({ index : tabs[i].index });
            break;
          }
        }
      });
    }
  }

  function deleteMatch(msg) {
    var tab = arguments[arguments.length-1],index;

    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      if ( /^\d+$/.test(msg.keyword) ){
        chrome.tabs.remove(tabs[Number(msg.keyword) - 1].id);
      } else {
        var regexp = new RegExp(msg.keyword,'i');
        for(var i = 0; i < tabs.length ;i++) {
          if (regexp.test(tabs[i].url) || regexp.test(tabs[i].title)) {
            Tab.close(tabs[i]);
          }
        }
      }
    });
  }

  return {
    gotoFirstMatch : gotoFirstMatch,
    deleteMatch : deleteMatch
  };
})();

