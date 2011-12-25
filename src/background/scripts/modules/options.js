function initOptionPage() {
	var text = Settings.get('vromerc');
	var elem = document.getElementById('vromerc');
	elem.value = text;
}

function saveOptions() {
	var elem = document.getElementById('vromerc');
	elem.value = parseVromerc(elem.value);
  Settings.add({vromerc: elem.value});
}

function tabClick(num) {
	var show_num = num;
	var oppose_num = (num == 1 ?  2 : 1);

	document.getElementById('sel' + show_num).setAttribute("class", "selected");
	document.getElementById('sel' + oppose_num).setAttribute("class", "");
	document.getElementById('tab' + show_num).setAttribute("class", "");
	document.getElementById('tab' + oppose_num).setAttribute("class", "hide");
}
