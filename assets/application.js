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
	var data = '';
	for(var i = 0;i < elements.length;i++){
		data += " " + elements[i].value;
	}
	localStorage.disableSites = data;
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
		if(input.value && new RegExp(input.value,'i').test(localStorage.currentUrl || '')){
			input.setAttribute('highlight','current');
		}else{
			input.removeAttribute('highlight');
		}
	}

	elements[i-1].appendChild(addButton);
}

function init() {
	var disable_sites = (localStorage.disableSites || '').split(' ');

  removeElements(document.getElementsByClassName('disable_site_box'));

	for(var i in disable_sites){
		if(!/^\s*$/.test(disable_sites[i])) addSite(disable_sites[i]);
	}
  var elem = document.getElementById('enable_vrome_checkbox');
  if(elem){
    elem.checked = (localStorage.currentPageDisabled == 'false');
  }
	addSite('');
	addIcons();
}

function changeStatus(/*Boolean|Checked*/ enable) {
  var port = chrome.tabs.connect(Number(localStorage.tab_id), {});
  port.postMessage({ action : "changeStatus", disable : !enable ,force : true});
}
