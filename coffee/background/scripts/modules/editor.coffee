class Editor
  @open: (msg) ->
    tab = getTab(arguments)

    $.post(
      getLocalServerUrl(), JSON.stringify(method: "open_editor", editor: Option.get("editor"), data: msg.data, col: msg.col, line: msg.line)
    ).fail(->
      runScript {code: "CmdBox.set({title : 'Failed to open external Editor, Please check Vrome WIKI opened in new tab for how to do',timeout : 15000});"}, tab
      chrome.tabs.create url: "https://github.com/jinzhu/vrome/wiki/Support-External-Editor", index: tab.index + 1, selected: false
    ).done (data) ->
      Post tab, {action: msg.callbackAction, edit_id: msg.edit_id, value: data}


root = exports ? window
root.Editor = Editor
