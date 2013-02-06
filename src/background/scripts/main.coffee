# Open Pages
openHelpWebsite = ->
  openOrSelectUrl "https://github.com/jinzhu/vrome#readme"
openChromeStore = ->
  openOrSelectUrl "https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details"
openIssuesPage = ->
  openOrSelectUrl "https://github.com/jinzhu/vrome/issues"
openSourcePage = ->
  openOrSelectUrl "https://github.com/jinzhu/vrome"
openOptions = (params) ->
  url = "background/options.html"
  url += "#" + params  if params
  openOrSelectUrl chrome.extension.getURL(url)
openOrSelectUrl = (url) ->
  chrome.tabs.getAllInWindow null, (tabs) ->
    for i of tabs # check if Options page is open already
      tab = tabs[i]
      if tab.url is url
        chrome.tabs.update tab.id,
          selected: true

        # select the tab
        return
    chrome.tabs.getSelected null, (tab) -> # open a new tab next to currently selected tab
      chrome.tabs.create
        url: url
        index: tab.index + 1

storeLastCommand = (msg) ->
  tab = arguments_[arguments_.length - 1]
  Settings.add
    currentKeys: msg.currentKeys
    times: msg.times

runScript = (msg) ->
  tab = arguments_[arguments_.length - 1]
  code = msg.code
  chrome.tabs.executeScript tab.id,
    code: code


# Notify new version
checkNewVersion = ->
  $.get chrome.extension.getURL("manifest.json"), (data) ->
    currentVersion = JSON.parse(data).version
    if Settings.get("version") isnt currentVersion
      openOptions "changelog"
    Settings.add version: currentVersion


Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message, (response) ->


logError = (err) ->
  console.log err
  $.post getLocalServerUrl(), JSON.stringify({method: "print_messages", messages: err})


window.addEventListener "error", (err) ->
  logError err
  , false

getTab = (args) ->
  args[args.length-1]

checkNewVersion()

root = exports ? window
root.logError = logError
root.Post = Post
root.checkNewVersion = checkNewVersion
root.getTab = getTab
