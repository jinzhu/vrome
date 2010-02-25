var Post = function(tab,message) {
  var port = chrome.tabs.connect(tab.id, {});
  port.postMessage(message);
}

function storeLastCommand(msg) {
  var tab = arguments[arguments.length-1];
  Settings.add({ currentKeys : msg.currentKeys, times : msg.times });
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
  xhr.send('{"method":"open_editor","editor":"' + Option.get("editor") + '", "data" : "' + msg.data + '"}');
}

// notify new version
// var appVersion = "0.3.3";
// function checkFirstTime() {
// 	if (!Settings.get("firstTime")) {
//     Settings.add({ firstTime : true});
//     Settings.add({ version : appVersion});
//     Settings.add({ hotkeys : defaultVimKeyBindings });
//     return true;
// 	}
// 	return false;
// }
//
// function checkNewVersion() {
// 	if (Settings.get("version") != appVersion) {
//     Settings.add({version : appVersion});
// 	}
// }
//
// if (!checkFirstTime()) { checkNewVersion(); } //add to init
