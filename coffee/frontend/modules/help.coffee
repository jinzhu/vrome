class window.Help
  maps = []

  escape = (value) ->
    value.toString().escape()

  @add: (key, funcName, func, mode) ->
    maps.push [escape(key), escape(funcName), escape(func.description), mode] if func.description

  @show: ->
    results = "<tr class='head'><td>Value</td><td>Description</td><td>Modes</td></tr>"
    results += ("<tr><td>#{map[0]}</td><td>#{map[2]}</td><td>#{map[3]}</td></tr>" for map in maps).join()
    resultBox = $('<div>', id: '__vrome_help_box',     html: "<table>#{results}</table>")
    helpBox   = $('<div>', id: '__vrome_help_overlay', html: resultBox)
    $(document.documentElement).append helpBox
  desc @show, 'Open help page'

  @hide: (reset) ->
    $('#__vrome_help_overlay').remove()
