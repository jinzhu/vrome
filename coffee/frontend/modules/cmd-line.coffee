class CmdLine
  [commands, CmdLineMode] = [{}, null]

  @add: (command, description, func, acceptArgs) -> #String, #Function
    commands[command] = {name: command, description: description, func: func, hasArgs: acceptArgs}


  @start: ->
    CmdLineMode = true
    Dialog.start "Command-line", "", filterCommands, false, handleEnterKey


  getFilteredCommands = (keyword) ->
    strcmd = keyword.split(" ").shift()
    command for command, key in commands when key.startsWith strcmd

  filterCommands = (keyword) ->
    cuteCommands = {title: command.name, url: command.description} for command in getFilteredCommands(keyword)
    Dialog.draw urls: cuteCommands, keyword: ""

  handleEnterKey = (e) ->
    return unless CmdLineMode
    [key, string] = [getKey(e), CmdBox.get().content]
    filterCommands = getFilteredCommands string

    if isAcceptKey(key) or (filterCommands.length is 1 and filterCommands[0].hasArgs isnt true)
      try
        Dialog.stop true
        cmd = filterCommands[0] # use the first command
        args = string.substring(string.indexOf(" ")) if cmd.hasArgs
        cmd.func.call "", args
      catch err
        Debug err
      CmdLineMode = false


root = exports ? window
root.CmdLine = CmdLine
