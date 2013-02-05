switchTab = (tab_name) ->
  tab_navs = document.body.querySelectorAll("nav #tabs li a")
  i = 0

  while i < tab_navs.length
    tab_nav = tab_navs[i]
    unless tab_nav.getAttribute("href") is "#" + tab_name
      tab_nav.setAttribute "class", ""
    else
      tab_nav.setAttribute "class", "selected"
    i++
  tab_sections = document.body.querySelectorAll("section .tabContent")
  i = 0

  while i < tab_sections.length
    tab_section = tab_sections[i]
    unless tab_section.id is tab_name + "Content"
      tab_section.style.display = "none"
    else
      tab_section.style.display = "block"
    i++
initOptionPage = ->
  text = Settings.get("vromerc")
  elem = document.getElementById("vromerc")
  elem.value = text
  onlineUrl = Settings.get("onlineVromercUrl")
  document.getElementById("onlineVromercUrl").value = onlineUrl
  reloadInterval = Settings.get("onlineVromercReloadInterval")
  document.getElementById("onlineVromercReloadInterval").value = reloadInterval
  lastUpdatedAt = Settings.get("onlineVromercLastUpdatedAt")
  document.getElementById("onlineVromercLastUpdatedAt").innerHTML = lastUpdatedAt
  changeAccessButtonStatus oauth.hasToken()
  switchTab document.location.hash.replace(/^#/, "") or "setting"
  
  # add listeners
  links = document.getElementsByTagName("a")
  _.each links, (v) ->
    if v and v.parentNode and v.parentNode.parentNode
      v.addEventListener "click", (e) ->
        switchTab v.hash.substring(1)
        e.stopPropagation()
        false


saveOnlineVromerc = ->
  Settings.add onlineVromercUrl: document.getElementById("onlineVromercUrl").value
  Settings.add onlineVromercReloadInterval: document.getElementById("onlineVromercReloadInterval").value
saveOptions = ->
  elem = document.getElementById("vromerc")
  elem.value = Vromerc.parse(elem.value)
  Settings.add vromerc: elem.value
  saveOnlineVromerc()
  Vromerc.loadAll()
  initOptionPage()
  $("#saved").show()
  $("#saved").fadeOut 3000
renderPages = ->
  render document.getElementById("dashboardContent"), "/README.html"
  render document.getElementById("settingContent"), "/files/setting.html"
  render document.getElementById("donatesContent"), "/files/donates.html"
  render document.getElementById("changelogContent"), "/files/changelog.html"
  render document.getElementById("thanksContent"), "/files/thanks.html"
  render document.getElementById("featuresContent"), "/files/features.html"
$(document).ready ->
  renderPages()
  initOptionPage()
  window.setInterval checkServerStatus, 1000
  checkServerStatus()
  $(".saveOptions").click saveOptions
  $(".closeWindow").click window.close
  $("#grantAccess").click grantOAuthAccess
  $("#revokeAccess").click revokeOAuthAccess

