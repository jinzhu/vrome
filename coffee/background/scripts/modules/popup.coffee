applyEvents = ->
  $('.openOptionsFeatures').click  -> openOptions 'features'
  $('.openOptionsSetting').click   -> openOptions 'setting'
  $('.openOptionsChangelog').click -> openOptions 'changelog'
  $('.openOptionsDonates').click   -> openOptions 'donates'

  $('.openSourcePage').click  openSourcePage
  $('.openChromeStore').click openChromeStore
  $('.openIssuesPage').click  openIssuesPage

  $('.version').text Settings.get('version')

$ ->
  window.setTimeout applyEvents, 500
