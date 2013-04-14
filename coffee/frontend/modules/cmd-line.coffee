class CmdLine
  [commands, cmdLineMode] = [{}, null]

  @add: (command, func, acceptArgs) -> #String, #Function
    commands[command] = {name: command, description: func?.description, func: func, hasArgs: acceptArgs}


  @start: ->
    cmdLineMode = true
    Dialog.start title: "Command-line", search: searchCommands, ontab: onTabFunc
  desc @start, "Start command line"

  onClickFuc = (command) ->
    (e) ->
      [title, keywords] = [$(e.target).attr("title"), CmdBox.get().content.split(" ")]
      content  = [title, keywords[1..-1].join(" ")].join(" ")
      CmdBox.softSet content: content
      command.func.call "", keywords[1..-1].join(" ")
      Dialog.stop()
      false

  onSelectFunc = (e) ->
    [title, content] = [$(e.target).attr("title"), CmdBox.get()._content.trim()]
    title = title + " "
    if title.startsWith(content) and not content.startsWith(title.trim())
      CmdBox.softSet content: title, selection: title.trimFirstStr(content)

  onTabFunc = (e) ->
    result = false
    if (CmdBox.get().selection?.length)
      CmdBox.softSet content: CmdBox.get().content, select_last: true
      return true

    [title, contents] = [Dialog.current()?.attr("title") || "", CmdBox.get().content.split(" ")]
    if !title.startsWith(contents[0])
      contents[0] = title
      CmdBox.softSet content: contents.join(" ").trim() + " "
      return true
    false

  searchCommands = () ->
    keyword = CmdBox.get()._content
    cmd = keyword.split(" ").shift()

    available = []
    add_to_available = (command) ->
      available.push(command) if command not in available
    add_to_available(command) for key, command of commands when key.startsWith(cmd)
    add_to_available(command) for key, command of commands when key.indexOf(cmd) isnt -1
    regexp = RegExp(cmd.split('').join(".*"), 'i')
    add_to_available(command) for key, command of commands when regexp.test(key)
    add_to_available(command) for key, command of commands when regexp.test(command.description)


    cuteCommands = for command in available
      title: command.name, description: command.description, onclick: onClickFuc(command), onselect: onSelectFunc
    Dialog.draw urls: cuteCommands, keyword: ""


root = exports ? window
root.CmdLine = CmdLine
