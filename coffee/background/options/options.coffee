# Render partial in option page
render = (elem, template, callback) ->
  $.get chrome.extension.getURL(template), (data) ->
    elem.html data
    do callback

# Switch tabs
switchTab = (tabName) ->
  $('nav #tabs li a').removeClass 'selected'
  $("nav #tabs li a[href=#{tabName}]").addClass 'selected'
  $('section .tabContent').hide()
  $("#{tabName}Content").show()

# Render all partials
renderPages = (callback) ->
  count = 6
  decreaseCount = ->
    do callback if --count is 0

  render $('#dashboardContent'), '/README.html',          decreaseCount
  render $('#settingContent'),   '/files/setting.html',   decreaseCount
  render $('#donatesContent'),   '/files/donates.html',   decreaseCount
  render $('#changelogContent'), '/files/changelog.html', decreaseCount
  render $('#thanksContent'),    '/files/thanks.html',    decreaseCount
  render $('#featuresContent'),  '/files/features.html',  decreaseCount

  # switch tab
  switchTab(document.location.hash or '#setting')
  $('nav #tabs li a').click -> switchTab $(this).attr('href')

# Input values
setSettings = ->
  $('#vromerc').val                     Settings.get('vromerc')
  $('#onlineVromercUrl').val            Settings.get('onlineVromercUrl')
  $('#onlineVromercReloadInterval').val Settings.get('onlineVromercReloadInterval')
  $('#onlineVromercLastUpdatedAt').val  Settings.get('onlineVromercLastUpdatedAt')
  # oauth
  changeAccessButtonStatus oauth.hasToken()

saveSettings = ->
  Settings.add
    onlineVromercUrl:            $('#onlineVromercUrl').val(),
    onlineVromercReloadInterval: $('#onlineVromercReloadInterval').val(),
    vromerc:                     Vromerc.parse($('#vromerc').val())

  do setSettings

saveOptions = ->
  saveSettings()
  Vromerc.loadAll()
  $('#saved').show().fadeOut 3000

checkServerStatus = ->
  request = $.ajax getLocalServerUrl()
  request.done ->
    $('#server_status').attr 'src', '/images/server_online.png'
    $('#server_status').attr 'alt', 'Server Online'
  request.fail ->
    $('#server_status').attr 'src', '/images/server_offline.png'
    $('#server_status').attr 'alt', 'Server Offline. Run ./vrome'

onAuthorize = ->
  changeAccessButtonStatus true
  delete chrome.extension.getBackgroundPage().OnAuthorizeCallBack

grantOAuthAccess = ->
  chrome.extension.getBackgroundPage().OnAuthorizeCallBack = onAuthorize
  chrome.tabs.create url: '/oauth/chrome_ex_oauth.html'

revokeOAuthAccess = ->
  chrome.extension.getBackgroundPage().oauth.clearTokens()
  changeAccessButtonStatus false

changeAccessButtonStatus = (granted) ->
  $('#revokeAccess').get(0).disabled = not granted
  $('#grantAccess').get(0).disabled = granted

$ ->
  $('body').on 'click', '.saveOptions',  saveOptions
  $('body').on 'click', '.closeWindow',  window.close
  $('body').on 'click', '#grantAccess',  grantOAuthAccess
  $('body').on 'click', '#revokeAccess', revokeOAuthAccess

Settings.init ->
  renderPages ->
    do setSettings
    setInterval checkServerStatus, 1000
