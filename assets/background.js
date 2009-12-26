var Vrome = (function(){
  function enable(){
    chrome.browserAction.setIcon({path: 'assets/logo.png'});
    chrome.browserAction.setTitle({title:"Vrome (enabled)"});
  }

  function disable(){
    chrome.browserAction.setIcon({path: 'assets/logo-disable.png'});
    chrome.browserAction.setTitle({title:"Vrome (disabled)"});
  }
  return { enable : enable, disable : disable }
})()

var Tab = (function(){
  function close(msg){
    var tab = arguments[arguments.length-1];
    current_closed_tab = tab;
    chrome.tabs.remove(tab.id);
    if(msg.focusLast) lastSelected.apply('',arguments); // close and selects last
    if(msg.offset) goto.apply('',arguments);            // close and select left
  }

  function reopen(msg){
    if (closed_tabs.length > 0) {
      var index = closed_tabs.length - msg.num;
      var last_closed_tab = closed_tabs[closed_tabs.length - msg.num];
      console.log("last_closed_tab: " + last_closed_tab);
      if(last_closed_tab){
        closed_tabs.splice(index,1);
        chrome.tabs.create({url: last_closed_tab.url, index: last_closed_tab.index});
      }
    }
  }

  function goto(msg){
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      if(typeof msg.index != 'undefined') { var index = msg.index; }
      if(typeof msg.offset != 'undefined'){ var index = tab.index + msg.offset; }

      if(index){
        index = index % tabs.length;
        if (index < 0){ index = index + tabs.length; }
      }

      console.log("gotoTab:" + index + " index:" + msg.index + " offset:" + msg.offset);
      var get_tab = tabs[index] || tab;
      chrome.tabs.update(get_tab.id, {selected: true});
    });
  }

  function lastSelected(){
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      chrome.tabs.update(last_selected_tab.id, {selected: true});
    });
  }

  function reloadAll(msg){
    var tab = arguments[arguments.length-1];
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      for (var i in tabs) {
        var tab = tabs[i];
        chrome.tabs.update(tab.id, {url: tab.url, selected: tab.selected}, null);
      }
    });
  }

  return {
    close        : close,
    reopen       : reopen,
    goto         : goto,
    lastSelected : lastSelected,
    reloadAll    : reloadAll
  }
})()

function open_url(msg){
  var tab = arguments[arguments.length-1];
  var urls      = msg.urls;
  if(typeof msg.urls == 'string') urls = [msg.urls];
  var first_url = urls.shift();
  var index     = tab.index;

  if (msg.newtab) { 
    chrome.tabs.create({url: first_url, index: ++index});
  } else {
    chrome.tabs.update(tab.id, {url: first_url});
  }
  for(var i = 0;i < urls.length;i++){
    chrome.tabs.create({url: urls[i], index: ++index,selected: false});
  }
}

function setLastCommand(msg) {
  var tab = arguments[arguments.length-1];
  Settings.add({ currentKeys : msg.currentKey, times : msg.times });
}

function debug(msg){
  var tab = arguments[arguments.length-1];
  console.log(tab.url + " : \n" + msg.message);
}

function currentPageDisabled(msg){
  Settings.add({ currentPageDisabled : msg.disable });
}


var Buffer = (function() {
  function gotoFirstMatch(msg){
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

  return {
    gotoFirstMatch : gotoFirstMatch,
  }
})()
