$(document).ready ->
  $(".openOptionsFeatures").click -> openOptions "features"
  $(".openOptionsSetting").click -> openOptions "setting"
  $(".openOptionsChangelog").click -> openOptions "changelog"
  $(".openOptionsDonates").click -> openOptions "donates"

  $(".openSourcePage").click openSourcePage
  $(".openChromeStore").click openChromeStore
  $(".openIssuesPage").click openIssuesPage

  $(".version").val(Settings.get("version"))
