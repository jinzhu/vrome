function switchTab(tab_name) {
  var tab_navs = document.body.querySelectorAll('nav #tabs li a');
  for (var i=0; i < tab_navs.length; i++) {
    var tab_nav = tab_navs[i];
    if (tab_nav.getAttribute('href') != "#" + tab_name) {
      tab_nav.setAttribute("class", "");
    } else {
      tab_nav.setAttribute("class", "selected");
    }
  }

  var tab_sections = document.body.querySelectorAll('section .tabContent');
  for (var i=0; i < tab_sections.length; i++) {
    var tab_section = tab_sections[i];
    if (tab_section.id != tab_name + 'Content') {
      tab_section.style.display = 'none';
    } else {
      tab_section.style.display = 'block';
    }
  }
}
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

	changeAccessButtonStatus(oauth.hasToken());
  switchTab(document.location.hash.replace(/^#/,"") || 'setting');
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
