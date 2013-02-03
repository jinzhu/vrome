$(document).ready(function() {
  $(".openOptionsFeatures").click(function() {
    openOptions('features');
  })

  $(".openOptionsSetting").click(function() {
    openOptions('setting');
  })

  $(".openOptionsChangelog").click(function() {
    openOptions('changelog');
  })

  $(".openSourcePage").click(openSourcePage);

  $(".openChromeStore").click(openChromeStore);

  $(".openIssuesPage").click(openIssuesPage);
  $(".openOptionsDonates").click(function() { openOptions('donates') });

  var elems = document.getElementsByClassName('version');
  for(var i=0; i < elems.length; i++) {
    elems[i].innerText = Settings.get('version');
  }
})
