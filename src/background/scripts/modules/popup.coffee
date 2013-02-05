$(document).ready ->
  $(".openOptionsFeatures").click ->
    openOptions "features"

  $(".openOptionsSetting").click ->
    openOptions "setting"

  $(".openOptionsChangelog").click ->
    openOptions "changelog"

  $(".openSourcePage").click openSourcePage
  $(".openChromeStore").click openChromeStore
  $(".openIssuesPage").click openIssuesPage
  $(".openOptionsDonates").click ->
    openOptions "donates"

  elems = document.getElementsByClassName("version")
  i = 0

  while i < elems.length
    elems[i].innerText = Settings.get("version")
    i++

