class Custom
  @loadCSS: ->
    customCSS = Settings.get('@configure.css')
    if customCSS
      $('head').append $('<style>', class: '__vrome_custom_css', text: customCSS)

  @runJS: ->
    customJS = Settings.get('@configure.js')
    if customJS
      $('body').append $('<script>', class: '__vrome_custom_js', text: customJS)

root = exports ? window
root.Custom = Custom
