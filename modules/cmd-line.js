var CmdLine = (function() {
  var commands = [];

	function add(/*String*/ command,/*Function*/ fun) {
    commands.push([command,fun]);
	}

  function start() {
    CmdBox.set({content : ''});
  }

  function exec() {
    /^(\S+)\s+(.*)$/.test(CmdBox.get().content);
    var cmd     = RegExp.$1;
    var arg     = RegExp.$2;
    var matched = [];

    for (var i = 0; i < commands.length; i++) {
      if (new RegExp('^' + cmd).test(commands[i][0])) {
        if (cmd == commands[i][0]) return commands[i][1].call('',arg);
        matched.push(commands[i][1]);
      }
    }
    if (matched.length == 1) return matched[0].call('',arg);
  }

  return { start : start, exec : exec , add : add };
})()

CmdLine.start.normalMode = true;
