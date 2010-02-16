var Vrome = (function() {
  function enable() {
    chrome.browserAction.setIcon({path: 'images/logo.png'});
    chrome.browserAction.setTitle({title:"Vrome (enabled)"});
    Settings.add({ currentPageDisabled : false });
  }

  function disable() {
    chrome.browserAction.setIcon({path: 'images/logo-disable.png'});
    chrome.browserAction.setTitle({title:"Vrome (disabled)"});
    Settings.add({ currentPageDisabled : true });
  }
  return { enable : enable, disable : disable }
})()

function open_url(msg) {
  var tab = arguments[arguments.length-1];
  var urls      = msg.urls || msg.url;
  if(typeof urls == 'string') urls = [urls];
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

function externalEditor(msg) {
  var tab = arguments[arguments.length-1],index;
  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:20000';
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      var port = chrome.tabs.connect(tab.id, {});
      port.postMessage({ action : "InsertMode.externalEditorCallBack", edit_id : msg.edit_id, value : xhr.responseText });
    };
  }

  xhr.setRequestHeader("Content-type", "text/plain");
  xhr.send("{'method':'open_editor','editor':'" + (Settings.get('editor') || 'gvim') + "', 'data' : '" + msg.data + "'}");
}

function shortUrl(msg) {
  var tab = arguments[arguments.length-1],index;
  var port = chrome.tabs.connect(tab.id, {});

  function sendBackCurrentUrl() {
    port.postMessage({ action : "Url.shortUrl", url : tab.url });
  }

  var xhr = new XMLHttpRequest();
  xhr.open( "GET", "http://is.gd/api.php?longurl=" + tab.url, false);
  xhr.onerror = sendBackCurrentUrl;
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
      if (xhr.status == 200) {
        port.postMessage({ action : "Url.shortUrl", url : xhr.responseText });
      }else{
        sendBackCurrentUrl();
      }
    }
  }
  xhr.send();
}

// notify new version
var appVersion = "0.3.3";
function checkFirstTime() {
	if (!Settings.get("firstTime")) {
    Settings.add({ firstTime : true});
    Settings.add({ version : appVersion});
    Settings.add({ hotkeys : defaultVimKeyBindings });
    return true;
	}
	return false;
}

function checkNewVersion() {
	if (Settings.get("version") != appVersion) {
		setIconTitle("You've been updated to a new version (" + appVersion + ")");
		setIconBadge(appVersion);
    Settings.add({version : appVersion});
	}
}

function setIconTitle(title) {
	chrome.browserAction.setTitle({ title: title || '' });
}

function setIconBadge(text) {
	chrome.browserAction.setBadgeBackgroundColor({ color: [75, 125, 255, 255] });
	chrome.browserAction.setBadgeText({ text: text || '' });
}

if (!checkFirstTime()) { checkNewVersion(); } //add to init
