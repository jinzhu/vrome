class Page
  execMatch = (regexps) ->
    for elem in $("a")
      for regexp in regexps
        return clickElement(elem) if new RegExp(regexp, "i").test($(elem).val().replace(/(^(\n|\s)+|(\s|\n)+$)/, ""))

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

  @openURLs: (args) ->
    if args.split(" ").length isnt 2
      CmdBox.set title: "Usage: dld-links [match] [begin;end]<br/> e.g dld-links mp4 3;20"
      return false
    match = args.split(" ")[0]
    pagination = args.split(" ")[1]
    begin = parseInt(pagination.split(";")[0])
    end = parseInt(pagination.split(";")[1])
    all = document.getElementsByTagName("a")
    all = _.filter(all, (v) ->
      v.href and v.href.indexOf(match) isnt -1
    )
    _.each all, (v, k) ->
      return  unless (k + 1) >= begin and (k + 1) <= end
      clickElement v,
        ctrl: true

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
