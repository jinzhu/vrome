function initOptionPage() {
	var text = Settings.get('vromerc');
	var elem = document.getElementById('vromerc');
	elem.value = text;

  var onlineUrl = Settings.get('onlineVromercUrl');
  document.getElementById('onlineVromercUrl').value = onlineUrl;

  var reloadInterval = Settings.get("onlineVromercReloadInterval");
  document.getElementById('onlineVromercReloadInterval').value = reloadInterval;

  var lastUpdatedAt = Settings.get("onlineVromercLastUpdatedAt");
  document.getElementById('onlineVromercLastUpdatedAt').innerHTML = lastUpdatedAt;
}

function saveOnlineVromerc() {
  Settings.add({onlineVromercUrl: document.getElementById('onlineVromercUrl').value});
  Settings.add({onlineVromercReloadInterval: document.getElementById('onlineVromercReloadInterval').value});
}

function saveOptions() {
	var elem = document.getElementById('vromerc');
	elem.value = Vromerc.parse(elem.value);
  Settings.add({vromerc: elem.value});

  saveOnlineVromerc();
  Vromerc.loadOnline();
  initOptionPage();
}

function tabClick(num) {
	var show_num = num;
	var oppose_num = (num == 1 ?  2 : 1);

	document.getElementById('sel' + show_num).setAttribute("class", "selected");
	document.getElementById('sel' + oppose_num).setAttribute("class", "");
	document.getElementById('tab' + show_num).setAttribute("class", "");
	document.getElementById('tab' + oppose_num).setAttribute("class", "hide");
}
