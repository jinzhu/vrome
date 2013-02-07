CmdLine = (->
  add = (command, description, fun, acceptArgs) -> #String
#Function
    commands[command] =
      description: description
      func: fun
      hasArgs: acceptArgs
  start = ->
    CmdLineMode = true
    Dialog.start "Command-line", "", filterCommands, false, handleEnterKey
  getFilteredCommands = (keyword) ->
    commandNames = _.keys(commands).sort()
    keywords = keyword.split(" ")
    strcmd = keywords.shift()
    commandNames = _.filter(commandNames, (v) ->
      v.startsWith strcmd
    )
    commandNames
  filterCommands = (keyword) ->
    cuteCommands = []
    commandNames = getFilteredCommands(keyword)
    _.each commandNames, (name) ->
      cuteCommands.push
        title: name
        url: commands[name].description


    Dialog.draw
      urls: cuteCommands
      keyword: ""

  handleEnterKey = (e) ->
    key = getKey(e)
    string = CmdBox.get().content
    commandNames = getFilteredCommands(string)
    if isAcceptKey(key) or (commandNames.length is 1 and commands[commandNames[0]].hasArgs isnt true)
      Dialog.stop true
      commandNames = [commandNames[0]]  if commandNames.length > 1
      cmdname = commandNames[0]
      cmd = commands[cmdname]
      fn = cmd.func
      args = ""
      args = string.substring(string.indexOf(" ")).trim()  if cmd.hasArgs
      if CmdLineMode
        try
          fn.call "", args
        catch err
          logError err
        CmdLineMode = false
      return true
    false
  commands = {}
  CmdLineMode = undefined
  start: start
  add: add
)()
