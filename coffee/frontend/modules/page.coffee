class Page
  execMatch = (regexps) ->
    for elem in $("a")
      for regexp in regexps
        return clickElement(elem) if new RegExp(regexp, "i").test($(elem).val().replace(/(^(\n|\s)+|(\s|\n)+$)/, ""))
    null # FIXME for CoffeeScriptRedux

  @hideImages = ->
    $("img").hide()

  @openOptions: ->
    Post action: "Tab.openUrl", urls: "/background/options.html", newtab: true

  @copySelected: ->
    text = getSelected()
    Clipboard.copy text
    CmdBox.set title: "[Copied]#{text.replace(/^(.{80})(.*)/, '$1...')}", timeout: 4000

  @transformURLs: ->
    document.body.innerHTML = document.body.innerHTML.transformURL()

  @editURLInExternalEditor = ->
    Post action: "Editor.open", data: window.location.href, callbackAction: "Page.editURLExternalEditorCallback"

  @editURLExternalEditorCallback: (msg) ->
    window.location.href = msg.value unless window.location.href is msg.value

  @next: ->
    execMatch Option.get("nextpattern")

  @prev: ->
    execMatch Option.get("previouspattern")


root = exports ? window
root.Page = Page
