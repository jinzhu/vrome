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

externalEditor = (msg) ->
  tab = arguments_[arguments_.length - 1]
  xhr = new XMLHttpRequest()
  xhr.open "POST", getLocalServerUrl(), true
  xhr.onerror = ->
    runScript
      code: "CmdBox.set({title : 'Failed to open external Editor, Please check Vrome WIKI opened in new tab for how to do',timeout : 15000});"
    , tab
    chrome.tabs.create
      url: "https://github.com/jinzhu/vrome/wiki/Support-External-Editor"
      index: tab.index + 1
      selected: false


  xhr.onreadystatechange = ->
    if xhr.readyState is 4 and xhr.status is 200
      Post tab,
        action: msg.callbackAction
        edit_id: msg.edit_id
        value: xhr.responseText


  xhr.setRequestHeader "Content-type", "text/plain"
  xhr.send JSON.stringify(
    method: "open_editor"
    editor: Option.get("editor")
    data: msg.data
    col: msg.col
    line: msg.line
  )

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

# checks if we have any messages for incomplete tabs and sends them
addErrorLogger = ->
  window.addEventListener "error", ((err) ->
    logError err
  ), false

# Notify new version
checkNewVersion = ->
  manifestRequest = new XMLHttpRequest()
  manifestRequest.open "GET", chrome.extension.getURL("manifest.json"), false
  manifestRequest.send null
  currentVersion = JSON.parse(manifestRequest.responseText).version
  if Settings.get("version") isnt currentVersion
    if Settings.get("version")
      openOptions "changelog"
    else
      openOptions "dashboard"
    Settings.add version: currentVersion
Post = (tab, message) ->
  chrome.tabs.sendMessage tab.id, message, (response) ->


checkNewVersion()
addErrorLogger()
