var CmdLine = (function() {
  var commands = {}
  var CmdLineMode;

  function add( /*String*/ command, description, /*Function*/ fun, acceptArgs) {
    commands[command] = {
      description: description,
      func: fun,
      hasArgs: acceptArgs
    }
  }

  function start() {
    CmdLineMode = true;
    Dialog.start('Command-line', '', filterCommands, false, handleEnterKey);
  }

  function getFilteredCommands(keyword) {
    var commandNames = _.keys(commands).sort()
    var keywords = keyword.split(' ')
    var strcmd = keywords.shift()

    commandNames = _.filter(commandNames, function(v) {
      return v.startsWith(strcmd)
    })

    return commandNames;
  }

  function filterCommands(keyword) {
    var cuteCommands = []

    var commandNames = getFilteredCommands(keyword)

    _.each(commandNames, function(name) {
      cuteCommands.push({
        title: name,
        url: commands[name].description
      })
    })

    Dialog.draw({
      urls: cuteCommands,
      keyword: ''
    })
  }

  function handleEnterKey(e) {
    var key = getKey(e)
    var string = CmdBox.get().content

    var commandNames = getFilteredCommands(string)

    if (isAcceptKey(key) || (commandNames.length === 1 && commands[commandNames[0]].hasArgs !== true)) {
      Dialog.stop(true)
      if (commandNames.length > 1) {
        commandNames = [commandNames[0]]
      }

      var cmdname = commandNames[0]
      var cmd = commands[cmdname]
      var fn = cmd.func
      var args = ''
      if (cmd.hasArgs) {
        args = string.substring(string.indexOf(' ')).trim()
      }
      if (CmdLineMode) {
        try {
          fn.call('', args)

        } catch (err) {
          logError(err)
        }
        CmdLineMode = false;
      }

      return true;
    }

    return false;
  }

  return {
    start: start,
    add: add
  };
})();
