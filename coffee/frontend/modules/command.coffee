class Command

  @reload_extension: ->
    Post action: "reloadExtension"

  @print: ->
    window.print()


root = exports ? window
root.Command = Command
