var defaultVimKeyBindings = [["F1","showHelp","normalMode"],["z+i", "Zoom.in", "normalMode"], ["z+o", "Zoom.out", "normalMode"], ["z+m", "Zoom.more", "normalMode"], ["z+r", "Zoom.reduce", "normalMode"], ["z+z", "Zoom.reset", "normalMode"], ["z+I", "Zoom.current_in", "normalMode"], ["z+O", "Zoom.current_out", "normalMode"], ["z+M", "Zoom.current_more", "normalMode"], ["z+R", "Zoom.current_reduce", "normalMode"], ["z+Z", "Zoom.current_reset", "normalMode"], ["]+]", "Page.next", "normalMode"], ["[+[", "Page.prev", "normalMode"], ["Y", "Page.copySelected", "normalMode"], ["g+u", "Url.parent", "normalMode"], ["g+U", "Url.root", "normalMode"], ["g+f", "Url.viewSource", "normalMode"], ["g+F", "Url.viewSourceNewTab", "normalMode"], ["C-a", "Url.increment", "normalMode"], ["C-x", "Url.decrement", "normalMode"], ["o", "Url.open", "normalMode"], ["O", "Url.openWithDefault", "normalMode"], ["t", "Url.tabopen", "normalMode"], ["T", "Url.tabopenWithDefault", "normalMode"], ["C-y", "Url.shortUrl", "normalMode"], ["g+g", "Scroll.top", "normalMode"], ["G", "Scroll.bottom", "normalMode"], ["0", "Scroll.first", "normalMode"], ["$", "Scroll.last", "normalMode"], ["k", "Scroll.up", "normalMode"], ["j", "Scroll.down", "normalMode"], ["h", "Scroll.left", "normalMode"], ["l", "Scroll.right", "normalMode"], ["%", "Scroll.toPercent", "normalMode"], ["C-f", "Scroll.nextPage", "normalMode"], ["C-b", "Scroll.prevPage", "normalMode"], ["C-d", "Scroll.nextHalfPage", "normalMode"], ["C-u", "Scroll.prevHalfPage", "normalMode"], ["r", "Tab.reload", "normalMode"], ["R", "Tab.reloadAll", "normalMode"], ["d", "Tab.close", "normalMode"], ["D", "Tab.closeAndFoucsLeft", "normalMode"], ["M-d", "Tab.closeAndFoucsLast", "normalMode"], ["u", "Tab.reopen", "normalMode"], ["C-p", "Tab.prev", "normalMode"], ["C-n", "Tab.next", "normalMode"], ["g+t", "Tab.next", "normalMode"], ["g+T", "Tab.prev", "normalMode"], ["y", "Tab.copyUrl", "normalMode"], ["g+0", "Tab.first", "normalMode"], ["g+^", "Tab.first", "normalMode"], ["g+$", "Tab.last", "normalMode"], ["C-6", "Tab.lastSelected", "normalMode"], ["C-^", "Tab.lastSelected", "normalMode"], ["H", "History.back", "normalMode"], ["L", "History.forward", "normalMode"], ["C-o", "History.back", "normalMode"], ["C-i", "History.forward", "normalMode"], [":", "CmdLine.start", "normalMode"], ["f", "Hint.start", "normalMode"], ["F", "Hint.new_tab_start", "normalMode"], ["/", "Search.start", "normalMode"], ["?", "Search.backward", "normalMode"], ["n", "Search.next", "normalMode"], ["N", "Search.prev", "normalMode"], ["*", "Search.forwardCursor", "normalMode"], ["#", "Search.backwardCursor", "normalMode"], ["b", "Buffer.gotoFirstMatch", "normalMode"], ["B", "Buffer.deleteMatch", "normalMode"], ["g+i", "InsertMode.focusFirstTextInput", "normalMode"], ["C-z", "KeyEvent.disable", "normalMode"], ["C-v", "KeyEvent.passNextKey", "normalMode"], [".", "KeyEvent.runLast", "normalMode"], ["C-i", "InsertMode.externalEditor", "insertMode"], ["C-[", "InsertMode.blurFocus", "insertMode"], ["C-a", "InsertMode.moveToFirstOrSelectAll", "insertMode"], ["C-e", "InsertMode.moveToEnd", "insertMode"], ["C-h", "InsertMode.deleteBackwardChar", "insertMode"], ["C-d", "InsertMode.deleteForwardChar", "insertMode"], ["C-w", "InsertMode.deleteBackwardWord", "insertMode"], ["M-d", "InsertMode.deleteForwardWord", "insertMode"], ["C-u", "InsertMode.deleteToBegin", "insertMode"], ["C-k", "InsertMode.deleteToEnd", "insertMode"], ["M-h", "InsertMode.MoveBackwardWord", "insertMode"], ["M-l", "InsertMode.MoveForwardWord", "insertMode"], ["M-j", "InsertMode.MoveBackwardChar", "insertMode"], ["M-k", "InsertMode.MoveForwardChar", "insertMode"], ["bdelete", "Buffer.deleteMatchHandle", "commandMode"]];

var defaultEmacsKeyBindings = [["Haven't been implement now.\nIt's would be very helpful if you can submit a patch for that.\n http://github.com/jinzhu/vrome OR wosmvp@gmail.com\n thanks.","",""]];


var removeButton = document.createElement('img');
removeButton.setAttribute('class','remove_buttons');
removeButton.setAttribute('onclick','removeElements([this.parentNode],true)');
removeButton.setAttribute('src','assets/remove.png');

var addButton = document.createElement('img');
addButton.setAttribute('class','add_buttons');
addButton.setAttribute('onclick','addSite()');
addButton.setAttribute('src','assets/add.png');

function saveData(/*Boolean*/ reinit){
	var elements = document.getElementsByClassName('disable_site');
	var data = [];
	for(var i = 0;i < elements.length;i++){
		data[data.length] = elements[i].value;
	}

	Settings.add({disableSites : data});
  if(reinit) init();
}

function addSite(value) {
	var div    = document.getElementById('disable_sites');

	var newBox = document.createElement('div');
	newBox.setAttribute('class','disable_site_box');
	var input  = document.createElement('input')
	input.setAttribute('onblur','saveData(true)');
	input.setAttribute('class','disable_site');

	newBox.appendChild(input);
	div.appendChild(newBox);

	value ? (input.value = value) : addIcons();
}

function removeElements(elements,addicon){
	var length  = elements.length;
	for(var i = 0;i < length;i++){
		elements[0].parentNode.removeChild(elements[0]);
	}
	saveData();
	if(addicon) addIcons();
}

function addIcons() {
	var elements = document.getElementsByClassName('disable_site_box');
	var removeAble = elements.length > 1;

	removeElements(document.getElementsByClassName('add_buttons'));
	removeElements(document.getElementsByClassName('remove_buttons'));

	for(var i = 0;i < elements.length ; i++){
		elements[i].appendChild(removeButton.cloneNode());

		var input = elements[i].firstChild;
		if(input.value && new RegExp(input.value,'i').test(Settings.get('currentUrl'))){
			input.setAttribute('highlight','current');
		}else{
			input.removeAttribute('highlight');
		}
	}

	elements[i-1].appendChild(addButton);
}

function init() {
	var disable_sites = Settings.get('disableSites');

  removeElements(document.getElementsByClassName('disable_site_box'));

	for(var i in disable_sites){
		if(!/^\s*$/.test(disable_sites[i])) addSite(disable_sites[i]);
	}
  var elem = document.getElementById('enable_vrome_checkbox');
  if(elem){
    elem.checked = !Settings.get('currentPageDisabled');
  }
	addSite('');
	addIcons();

  var elem = document.getElementById('vrome_editor');
  elem.value = Settings.get('editor');
}

function changeStatus(/*Boolean|Checked*/ enable) {
  var port = chrome.tabs.connect(Settings.get('now_tab_id'), {});
  port.postMessage({ action : "KeyEvent.changeStatus", arguments : enable });
}

function saveEditor(editor) {
	Settings.add({editor : editor});
}
