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

$ ->
  renderPages ->

    do setSettings
    window.setInterval checkServerStatus, 1000

    $('body').on 'click', '.saveOptions',  saveOptions
    $('body').on 'click', '.closeWindow',  window.close
    $('body').on 'click', '#grantAccess',  grantOAuthAccess
    $('body').on 'click', '#revokeAccess', revokeOAuthAccess
