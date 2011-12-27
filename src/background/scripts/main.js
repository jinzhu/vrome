var Post = function(tab,message) {
  var port = chrome.tabs.connect(tab.id, {});
  port.postMessage(message);
};

function storeLastCommand(msg) {
  var tab = arguments[arguments.length-1];
  Settings.add({ currentKeys : msg.currentKeys, times : msg.times });
}

function runScript(msg) {
  var tab = arguments[arguments.length-1];
  var code = msg.code;
  chrome.tabs.executeScript(tab.id, {code: code})
}

function externalEditor(msg) {
  var tab = arguments[arguments.length-1];
  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:' + Option.get('server_port');
  xhr.open("POST", url, true);
  xhr.onerror = function() {
    runScript({code: "CmdBox.set({title : 'Failed to open external Editor, Please check Vrome WIKI opened in new tab for how to do',timeout : 15000});"}, tab);
    chrome.tabs.create({ url: "https://github.com/jinzhu/vrome/wiki/Support-External-Editor", index: tab.index + 1, selected: false});
  };

  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      var port = chrome.tabs.connect(tab.id, {});
      port.postMessage({ action : "InsertMode.externalEditorCallBack", edit_id : msg.edit_id, value : xhr.responseText });
    }
  };

  xhr.setRequestHeader("Content-type", "text/plain");
  xhr.send(JSON.stringify({'method':'open_editor','editor': Option.get("editor"), 'data' : msg.data}));
}

// Notify new version
var manifestRequest = new XMLHttpRequest();
manifestRequest.open("GET", chrome.extension.getURL("manifest.json"), false);
manifestRequest.send(null);
var currentVersion = JSON.parse(manifestRequest.responseText).version;

if (Settings.get("version") !== currentVersion) {
  if (Settings.get("version")) {
    openOptions('changelog');
  } else {
    openOptions('dashboard');
  }
  Settings.add({version : currentVersion});
}

// Open Pages
function openHelpWebsite() {
	openOrSelectUrl("https://github.com/jinzhu/vrome#readme");
}

function openChromeStore() {
	openOrSelectUrl("https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details");
}

function openIssuesPage() {
	openOrSelectUrl("https://github.com/jinzhu/vrome/issues");
}

function openSourcePage() {
  openOrSelectUrl("https://github.com/jinzhu/vrome");
}

function openOptions(params) {
	var url = "background/options.html";
	if (params) { url += "#" + params; }
	openOrSelectUrl(chrome.extension.getURL(url));
}

function openOrSelectUrl(url) {
	chrome.tabs.getAllInWindow(null, function(tabs) {
		for (var i in tabs) { // check if Options page is open already
			var tab = tabs[i];
			if (tab.url == url) {
				chrome.tabs.update(tab.id, { selected: true }); // select the tab
				return;
			}
		}
		chrome.tabs.getSelected(null, function(tab) { // open a new tab next to currently selected tab
			chrome.tabs.create({
				url: url,
				index: tab.index + 1
			});
		});
	});
}

function render(elem, template) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL(template), false);
  xhr.send(null);
  elem.innerHTML = xhr.responseText;
}
