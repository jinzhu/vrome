var CmdLine = (function() {
  var commands = [];
  var CmdLineMode;

	function add(/*String*/ command,/*Function*/ fun) {
    commands.push([command,fun]);
	}

  function start() {
    CmdLineMode = true;
    CmdBox.set({content : ''});
  }

  function exec() {
    if (!CmdLineMode) { return; }
    /^(\S+)\s*(.*)$/.test(CmdBox.get().content);
    var cmd     = RegExp.$1;
    var arg     = RegExp.$2;
    var matched = [];

    for (var i = 0; i < commands.length; i++) {
      if (new RegExp('^' + cmd).test(commands[i][0])) {
        if (cmd == commands[i][0]) { return commands[i][1].call('',arg); }
        matched.push(commands[i][1]);
      }
    }
    if (matched.length == 1) { return matched[0].call('',arg); }
    CmdLineMode = false;
  }

  return { start : start, exec : exec , add : add };
})();
