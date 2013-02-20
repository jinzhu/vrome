class Page
  execMatch = (regexps) ->
    elems = for elem in $("a, link").filter(':visible').reverse()
      [elem, $(elem).text().replace(/(^(\n|\s)+|(\s|\n)+$)/, "")]

    for regexp in regexps
      for [elem, value] in elems
        return clickElement(elem) if new RegExp(regexp, "i").test(value)
    null # FIXME for CoffeeScriptRedux

  @copySelected: ->
    text = getSelected()
    Clipboard.copy text
    CmdBox.set title: "[Copied]#{text.replace(/^(.{80})(.*)/, '$1...')}", timeout: 4000

  @showInfo: ->
    CmdBox.set title: document.title, timeout: 4000

  @next: ->
    execMatch Option.get("nextpattern")

  @prev: ->
    execMatch Option.get("previouspattern")


root = exports ? window
root.Page = Page
