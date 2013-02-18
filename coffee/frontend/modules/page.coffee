class Page
  execMatch = (regexps) ->
    for elem in $("a")
      for regexp in regexps
        if new RegExp(regexp, "i").test($(elem).text().replace(/(^(\n|\s)+|(\s|\n)+$)/, ""))
          return clickElement(elem)
    null # FIXME for CoffeeScriptRedux

  @hideImages = ->
    $("img").hide()

  @copySelected: ->
    text = getSelected()
    Clipboard.copy text
    CmdBox.set title: "[Copied]#{text.replace(/^(.{80})(.*)/, '$1...')}", timeout: 4000

  @transformURLs: ->
    document.body.innerHTML = document.body.innerHTML.transformURL()

  @next: ->
    execMatch Option.get("nextpattern")

  @prev: ->
    execMatch Option.get("previouspattern")


root = exports ? window
root.Page = Page
