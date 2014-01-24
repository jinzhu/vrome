class Editor
  code = "CmdBox.set({title: 'Failed to open external Editor, Please check Vrome WIKI opened in a new tab for how to do', timeout : 15000});"

  @open: (msg) ->
    params = JSON.stringify
      method: 'open_editor'
      editor: Option.get 'editor'
      data:   msg.data
      col:    msg.col
      line:   msg.line

    post = $.post getLocalServerUrl(), params
    post.fail ->
      runScript {code}, msg.tab
      chrome.tabs.create
        url:    'https://github.com/jinzhu/vrome/wiki/Support-External-Editor'
        index:  msg.tab.index + 1
        active: false
    post.done (data) ->
      Post msg.tab,
        action: msg.callbackAction
        editId: msg.editId
        value:  data

root = exports ? window
root.Editor = Editor
