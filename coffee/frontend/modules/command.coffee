class Command

  @reload_extension: ->
    Post action: "reloadExtension"


root = exports ? window
root.Command = Command
