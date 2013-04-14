class Help
  @maps = []

  escape = (value) ->
    ('' + value).escape()

  @add: (key, func_name, func, mode) ->
    @maps.push([escape(key), escape(func_name), escape(func.description), mode]) if func.description

  @show: =>
    results = "<tr class='head'><td>Value</td><td>Description</td><td>Modes</td></tr>"
    results += ("<tr><td>#{map[0]}</td><td>#{map[2]}</td><td>#{map[3]}</td></tr>" for map in @maps).join()
    result_box = $("<div>", id: 'vromeHelpBox', html: "<table>#{results}</table>")
    help_box = $("<div>", id: 'vromeHelpOverlay', html: result_box)
    $("body").append help_box
  desc @show, "Open help page"

  @hide: (reset) ->
    $("#vromeHelpOverlay").remove()


root = exports ? window
root.Help = Help
