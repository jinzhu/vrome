openSourcePage  = -> openUrl 'https://github.com/jinzhu/vrome'
openChromeStore = -> openUrl 'https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details'
openIssuesPage  = -> openUrl 'https://github.com/jinzhu/vrome/issues'

$ ->
  $('.openOptionsFeatures').click  -> openOptions 'features'
  $('.openOptionsSetting').click   -> openOptions 'setting'
  $('.openOptionsChangelog').click -> openOptions 'changelog'
  $('.openOptionsDonates').click   -> openOptions 'donates'

  $('.openSourcePage').click  openSourcePage
  $('.openChromeStore').click openChromeStore
  $('.openIssuesPage').click  openIssuesPage

Settings.init ->
  $ ->
    $('.version').text Settings.get('version')
