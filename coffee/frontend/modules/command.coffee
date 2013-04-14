class Command

  @reload_extension: ->
    Post action: "reloadExtension"
  desc @reload_extension, "Reload All Extensions"

  @print: ->
    CmdBox.remove()
    setTimeout window.print, 500
  desc @print, "Print the current page you see"

  toggleHiddenElems = (all, elems) ->
    if all.length > 1
      all.removeAttr("__vrome_hidden")
    else
      elems.attr("__vrome_hidden", "1")

  @imagesToggle: ->
    toggleHiddenElems $("img[__vrome_hidden]"), $("img")
  desc @imagesToggle, "Toggle images"

  @imagesOnly: ->
    div = $("[__vrome_images]")
    if div.length > 0
      toggleHiddenElems $("body").children(), div.remove()
    else
      images = $('img').filter(':visible').clone()
      toggleHiddenElems [], $("body").children()
      $("body").append $("<div>", {__vrome_images: "1"}).append(images)
  desc @images_only, "Only show images, run again to rollback"

  @javascript: ->
    console.log eval(CmdBox.get().argument)
  desc @javascript, "Run javascript (jQuery)"

  @source: ->
    Post action: "Command.source", sources: CmdBox.get().argument
  desc @source, "Source javascript/style files"

  @css: ->
    div = $("style[__vrome_style]")
    $("body").append(div = $("<style>", {"__vrome_style": 1})) if div.length == 0
    div.text(div.text() + "\n" +  CmdBox.get().argument)
  desc @css, "Add css styles"


root = exports ? window
root.Command = Command
