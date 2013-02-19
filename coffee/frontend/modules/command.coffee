class Command

  @reload_extension: ->
    Post action: "reloadExtension"

  @print: ->
    CmdBox.remove()
    setTimeout window.print, 500

  toggleHiddenElems = (all, elems) ->
    if all.length > 1
      all.removeAttr("__vrome_hidden")
    else
      elems.attr("__vrome_hidden", "1")

  @imagesToggle: ->
    toggleHiddenElems $("img[__vrome_hidden]"), $("img")

  @imagesOnly: ->
    div = $("[__vrome_images]")
    if div.length > 0
      toggleHiddenElems $("body").children(), div.remove()
    else
      images = $('img').filter(':visible').clone()
      toggleHiddenElems [], $("body").children()
      $("body").append $("<div>", {__vrome_images: "1"}).append(images)

  @javascript: ->
    console.log eval(CmdBox.get().argument)

  @source: ->
    Post action: "Command.source", sources: CmdBox.get().argument

  @css: ->
    div = $("style[__vrome_style]")
    $("body").append(div = $("<style>", {"__vrome_style": 1})) if div.length == 0
    div.text(div.text() + "\n" +  CmdBox.get().argument)


root = exports ? window
root.Command = Command
