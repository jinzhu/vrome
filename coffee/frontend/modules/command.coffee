class window.Command
  VROME_HIDDEN = '__vrome_hidden'

  @reloadExtension: ->
    Post action: 'reloadExtension'
  desc @reloadExtension, 'Reload Extension'

  @print: ->
    CmdBox.remove()
    # Print after removing the cmdbox
    setTimeout window.print, 500
  desc @print, 'Print the current page'

  toggleHiddenElems = (all, elems) ->
    if all.length > 1
      all.removeAttr VROME_HIDDEN
    else
      elems.attr VROME_HIDDEN, '1'

  @imagesToggle: ->
    toggleHiddenElems $("img[#{VROME_HIDDEN}]"), $('img')
  desc @imagesToggle, 'Toggle images'

  @imagesOnly: ->
    div = $('[__vrome_images]')
    if div.length > 0
      toggleHiddenElems $body.children(), div.remove()
    else
      images = $('img').filter((_, e) -> isElementVisible $(e), true).clone()
      toggleHiddenElems [], $body.children()
      $body.append $('<div>', __vrome_images: '1').append(images)
  desc @imagesOnly, 'Only show images, run again to rollback'

  @javascript: ->
    console.log eval(CmdBox.get().argument)
  desc @javascript, 'Run javascript (jQuery)'

  @source: ->
    Post action: 'Command.source', sources: CmdBox.get().argument
  desc @source, 'Source javascript/style files'

  @css: ->
    div = $('style[__vrome_style]')
    if div.length is 0
      div = $('<style>', __vrome_style: 1)
      $body.append div
    div.text(div.text() + '\n' + CmdBox.get().argument)
  desc @css, 'Add CSS styles'
