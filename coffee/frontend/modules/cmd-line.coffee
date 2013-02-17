class CmdLine
  [commands, cmdLineMode] = [{}, null]

  @add: (command, description, func, acceptArgs) -> #String, #Function
    commands[command] = {name: command, description: description, func: func, hasArgs: acceptArgs}


  @start: ->
    cmdLineMode = true
    Dialog.start "Command-line", "", filterCommands, false


  filterCommands = (keyword) ->
    cmd = keyword.split(" ").shift()
    cuteCommands = for key, command of commands when key.startsWith cmd
      {title: command.name, url: command.description}
    Dialog.draw urls: cuteCommands, keyword: ""


root = exports ? window
root.CmdLine = CmdLine
