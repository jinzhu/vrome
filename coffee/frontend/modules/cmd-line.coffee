class CmdLine
  [commands, cmdLineMode] = [{}, null]

  @add: (command, description, func, acceptArgs) -> #String, #Function
    commands[command] = {name: command, description: description, func: func, hasArgs: acceptArgs}


  @start: ->
    cmdLineMode = true
    Dialog.start "Command-line", "", filterCommands, false

  onClickFuc = (command) ->
    ->
      keyword = CmdBox.get().content
      command.func.call "", keyword.substring(keyword.indexOf(" "))
      false

  onSelectFunc = (e) ->
    [title, content] = [$(e.target).attr("title"), CmdBox.get()._content]
    CmdBox.softSet content: title, selection: title.trimFirst(content) if title.startsWith(content)


  filterCommands = (keyword) ->
    cmd = keyword.split(" ").shift()
    cuteCommands = for key, command of commands when key.startsWith cmd
      title: command.name, url: command.description, onclick: onClickFuc(command), onselect: onSelectFunc
    Dialog.draw urls: cuteCommands, keyword: ""


root = exports ? window
root.CmdLine = CmdLine
