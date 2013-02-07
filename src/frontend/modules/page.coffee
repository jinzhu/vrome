Page = (->
  hideImages = ->
    imgs = document.getElementsByTagName("img")
    _.each imgs, (v) ->
      
      # toggle class name
      $(v).toggleClass "help_hidden"

  execMatch = (regexps) ->
    elems = document.getElementsByTagName("a")
    i = 0

    while i < regexps.length
      j = 0

      while j < elems.length
        return clickElement(elems[j])  if new RegExp(regexps[i], "i").test((elems[j].innerText or "").replace(/(^(\n|\s)+|(\s|\n)+$)/, ""))
        j++
      i++
    false
  copySelected = ->
    text = getSelected()
    Clipboard.copy text
    text = (if text.length > 80 then (text.slice(0, 80) + "...") else text)
    CmdBox.set
      title: "[Copied]" + text
      timeout: 4000

  styleDisable = ->
    cssFile = Option.get("chrome_custom_css_file") or Option.get("ccc_file")
    if cssFile
      $.ajax(
        type: "POST"
        url: getLocalServerUrl()
        data: JSON.stringify(
          method: "switch_chrome_css"
          filename: cssFile
        )
      ).done (data) ->
        if data
          CmdBox.set
            title: data
            timeout: 1000


  transformURLs = ->
    document.body.innerHTML = document.body.innerHTML.transformURL()
  openURLs = (args) ->
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


    true
  editURLInExternalEditor = ->
    Post
      action: "Editor.open"
      data: window.location.href
      callbackAction: "Page.editURLExternalEditorCallback"

  editURLExternalEditorCallback = (msg) ->
    window.location.href = msg.value  unless window.location.href is msg.value
  next: ->
    execMatch Option.get("nextpattern")

  prev: ->
    execMatch Option.get("previouspattern")

  copySelected: copySelected
  styleDisable: styleDisable
  transformURLs: transformURLs
  openURLs: openURLs
  editURLInExternalEditor: editURLInExternalEditor
  editURLExternalEditorCallback: editURLExternalEditorCallback
  openOptions: ->
    Post
      action: "Tab.openUrl"
      urls: "/background/options.html"
      newtab: true


  hideImages: hideImages
)()
