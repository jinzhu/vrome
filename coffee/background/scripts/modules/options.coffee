# Render partial in option page
render = (elem, template) ->
  $.get chrome.extension.getURL(template), (data) ->
    elem.html(data)


# Switch tabs
switchTab = (tab_name) ->
  $("nav #tabs li a").removeClass "selected"
  $("nav #tabs li a[href=#{tab_name}]").addClass "selected"
  $("section .tabContent").hide()
  $("#{tab_name}Content").show()


# Render all partials
renderPages = ->
  render $("#dashboardContent"), "/README.html"
  render $("#settingContent"), "/files/setting.html"
  render $("#donatesContent"), "/files/donates.html"
  render $("#changelogContent"), "/files/changelog.html"
  render $("#thanksContent"), "/files/thanks.html"
  render $("#featuresContent"), "/files/features.html"

  # switch tab
  switchTab document.location.hash or "#setting"
  $("nav #tabs li a").click -> switchTab $(this).attr("href")


# Input values
setSettings = ->
  $("#vromerc").val Settings.get("vromerc")
  $("#onlineVromercUrl").val Settings.get("onlineVromercUrl")
  $("#onlineVromercReloadInterval").val Settings.get("onlineVromercReloadInterval")
  $("#onlineVromercLastUpdatedAt").val Settings.get("onlineVromercLastUpdatedAt")

setOAuthToken = ->
  # oauth
  changeAccessButtonStatus oauth.hasToken()

saveSettings = ->
  Settings.add {
    onlineVromercUrl: $("#onlineVromercUrl").val(),
    onlineVromercReloadInterval: $("#onlineVromercReloadInterval").val(),
    vromerc: Vromerc.parse($("#vromerc").val())
  }
  setSettings()


saveOptions = ->
  saveSettings()
  Vromerc.loadAll()
  $("#saved").show().fadeOut 3000


$ ->
  renderPages()
  setSettings()

  window.setTimeout setOAuthToken, 1000
  window.setInterval checkServerStatus, 1000

  $('body').on('click', ".saveOptions", saveOptions)
  $('body').on('click', ".closeWindow", window.close)
  $('body').on('click', "#grantAccess", grantOAuthAccess)
  $('body').on('click', "#revokeAccess", revokeOAuthAccess)
