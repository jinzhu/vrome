class Command

  @reload_extension: ->
    Post action: "reloadExtension"

  @print: ->
    CmdBox.remove()
    window.print()

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
    eval CmdBox.get().argument


root = exports ? window
root.Command = Command
