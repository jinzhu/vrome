@Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message, (response) ->


@getTab = (args) -> args[args.length-1]


@storeLastCommand = (msg) ->
  Settings.add currentKeys: msg.currentKeys, times: msg.times


@runScript = (msg) ->
  tab = getTab(arguments)
  chrome.tabs.executeScript tab.id, code: msg.code


# Notify new version
@checkNewVersion = ->
  $.get chrome.extension.getURL("manifest.json"), (data) ->
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
  chrome.tabs.getAllInWindow null, (tabs) ->
    for tab in tabs when tab.url is url
      chrome.tabs.update tab.id, selected: true
      return
    chrome.tabs.getCurrent (tab) -> # open a new tab next to currently selected tab
      chrome.tabs.create url: url, index: tab.index + 1


$ ->
  window.addEventListener "error", (err) ->
    Debug err
    , false

  checkNewVersion()


root = exports ? window
for m in ["Post", "checkNewVersion", "getTab", "runScript", "storeLastCommand", "openHelpWebsite", "openChromeStore", "openIssuesPage", "openSourcePage", "openOptions", "openOrSelectUrl"]
  root[m] = self[m]
