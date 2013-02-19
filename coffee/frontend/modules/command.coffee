class Command

  @reload_extension: ->
    Post action: "reloadExtension"

  @print: ->
    CmdBox.remove()
    window.print()


root = exports ? window
root.Command = Command
