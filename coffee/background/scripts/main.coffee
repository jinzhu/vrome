@Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message, (response) ->


@getTab = (args) -> args[args.length-1]


@runScript = (msg) ->
  tab = getTab(arguments)
  chrome.tabs.executeScript tab.id, code: msg.code


# Notify new version
@checkNewVersion = ->
  $.get(chrome.extension.getURL("manifest.json")).done (data) ->
    data = JSON.parse data
    openOptions "changelog" if Settings.get("version") isnt data.version
    Settings.add version: data.version


@openHelpWebsite = -> @openOrSelectUrl "https://github.com/jinzhu/vrome#readme"
@openChromeStore = -> @openOrSelectUrl "https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details"
@openIssuesPage = -> @openOrSelectUrl "https://github.com/jinzhu/vrome/issues"
@openSourcePage = -> @openOrSelectUrl "https://github.com/jinzhu/vrome"
@openOptions = (params) ->
  url = "background/options.html#{if params then "##{params}" else ""}"
  @openOrSelectUrl chrome.extension.getURL(url)


@openOrSelectUrl = (url) ->
  if typeof url is 'string'
    msg = {url: url, newtab: true, selected: true}
  else
    [msg, current_tab] = [url, getTab(arguments)]
    url = msg.url

  chrome.tabs.getAllInWindow null, (tabs) ->
    for tab in tabs when tab.url is url
      chrome.tabs.update tab.id, selected: true
      return
    # open a new tab next to currently selected tab
    chrome.tabs.getSelected null, (get_tab) ->
      Tab.openUrl msg, current_tab || get_tab


window.addEventListener "error", ((err) -> Debug err), false
Settings.init(checkNewVersion)


root = exports ? window
for m in ["Post", "checkNewVersion", "getTab", "runScript", "storeLastCommand", "openHelpWebsite", "openChromeStore", "openIssuesPage", "openSourcePage", "openOptions", "openOrSelectUrl"]
  root[m] = self[m]
