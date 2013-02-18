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
      Dialog.stop()
      false

  onSelectFunc = (e) ->
    [title, content] = [$(e.target).attr("title"), CmdBox.get()._content.trim()]
    title = title + " "
    if title.startsWith(content) and not content.startsWith(title.trim())
      CmdBox.softSet content: title, selection: title.trimFirstStr(content)


  filterCommands = () ->
    keyword = CmdBox.get()._content
    cmd = keyword.split(" ").shift()

    available = []
    add_to_available = (command) ->
      available.push(command) if command not in available
    add_to_available(command) for key, command of commands when key.startsWith(cmd)
    add_to_available(command) for key, command of commands when key.indexOf(cmd) isnt -1
    regexp = RegExp(keyword.split('').join(".*"))
    add_to_available(command) for key, command of commands when regexp.test(key)

    cuteCommands = for command in available
      title: command.name, url: command.description, onclick: onClickFuc(command), onselect: onSelectFunc
    Dialog.draw urls: cuteCommands, keyword: ""


root = exports ? window
root.CmdLine = CmdLine
