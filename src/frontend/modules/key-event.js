var KeyEvent = (function() {
  var times = 0;
  var disableVrome, pass_next_key;

  function init() {
    // disabled sites
    var disable_sites = Option.get("disablesites").split(", ");
    for (var i = 0; i < disable_sites.length ; i++) {
      if (disable_sites[i] && new RegExp(disable_sites[i],'i').test(location.href)) {
        disable();
        break;
      }
    }

    if (!document.vromeEventListenerAdded) {
      document.addEventListener('keydown', KeyEvent.exec, true);
      document.vromeEventListenerAdded = true;
    }
  }

  function getTimes(/*Boolean*/ only_read) {
    var origin_times = times;
    if (!only_read) { times = 0; } // reset count it if used.
    return origin_times;
  }

  ///////////////////////////////////////////////////
  // Last Commands
  ///////////////////////////////////////////////////
  function storeLast(/*Array*/ currentKeys,/*Number*/ times) {
    times = times || 0;
    Settings.add("background.currentKeys", currentKeys);
    Settings.add("background.times", times);
    Post({action : "storeLastCommand", currentKeys : currentKeys, times : times});
  }

  function runLast() {
    runCurrentKeys(Settings.get("background.currentKeys"));
  }

  ///////////////////////////////////////////////////
	var bindings    = [];
	var currentKeys = "";

	function add(/*String*/ keys,/*Function*/ func,/*Boolean*/ insert_mode) {
		bindings.push([keys, func, !!insert_mode]);
	}

	function reset() {
		currentKeys = "";
    times = 0;
	}

  ///////////////////////////////////////////////////
  function passNextKey() {
		CmdBox.set({title : ' -- PASS THROUGH (next) -- ',timeout : 2000 });
    pass_next_key  = true;
    Post({action : "Vrome.disable"});
  }

	function disable() {
		CmdBox.set({title : ' -- PASS THROUGH -- ' });
    disableVrome = true;
	}

  function enable() {
    CmdBox.remove();
    disableVrome  = false;
    pass_next_key = false;
    reset();
  }

  ///////////////////////////////////////////////////
  function filterKey(key, insertMode) {
    var configure = Settings.get('background.configure');
    var mode = insertMode ? 'imap' : 'map';
    if (/^\d$/.test(key)) { return key; }
    return (configure[mode] && configure[mode][key]) || key;
  }

  function ignoreKey(key, insertMode) {
    var configure = Settings.get('background.configure');
    var mode = insertMode ? 'iunmap' : 'unmap';
    if (configure[mode] && configure[mode][key]) { return true; }
  }

  function runCurrentKeys(keys, insertMode, e) {
    if (!keys) { return; }
    var key        = null;
    var last_times  = null;

    if (e) { key = getKey(e); }

		// when run last command, fix run time.
    if (key == '.' && !insertMode) {
      last_times = Settings.get('background.times');
			times = (last_times || 1) * (times || 1);
		} else {
      last_times = times;
    }

    for (var i = 0; i < bindings.length; i++) {
      // 0 is a special command. could be used to scroll left, also could be used as run count.
      if (times > 0 && keys.match(/^\d$/)) { break }

      var binding          = bindings[i];
      var binding_command  = binding[0];
      var binding_function = binding[1];
      var binding_mode     = binding[2]; // insert mode or not
      var escaped_command  = binding_command.replace(/([(\[{\\^$|)?*+.])/g,"\\$1");  // "[[" -> "\\[\\["

      // insertMode match?
      if (!!insertMode != binding_mode) continue;

      var regexp = new RegExp('^(\\d*)(' + escaped_command + ')$');
      if (regexp.test(keys)) {
        var someFunctionCalled = true;
        keys.replace(regexp,'');
        // map j 3j
        var map_times = Number(RegExp.$1);
        if (map_times > 0) { times = map_times * (times || 1); }
        binding_function.call(e);
        if (map_times > 0) { times = last_times; }
      }

      var regexp = new RegExp('^(' + keys.replace(/([(\[{\\^$|)?*+.])/g,"\\$1") + ')');
      if (regexp.test(binding_command)) {
        var someBindingMatched = true;
      }
    }
    // TODO Refact me
    if ((someBindingMatched == undefined) && !keys.match(/^\d$/)) {
      var configure = Settings.get('background.configure');
      var mode = insertMode ? 'imap' : 'map';
      if (configure[mode]) {
        for (var i in configure[mode]) {
          var regexp = new RegExp('^(' + keys.replace(/([(\[{\\^$|)?*+.])/g,"\\$1") + ')');
          if (regexp.test(i)) {
            var someBindingMatched = true;
          }
        }
      }
    }

    // If any function invoked, then store it to last run command.
    // (Don't do this when run repeat last command or In InsertMode)
    if (someFunctionCalled && e && key != '.' && !insertMode) {
      storeLast(keys, times);
    }

    // Reset currentKeys if nothing match or some function called
    if (!someBindingMatched || someFunctionCalled) currentKeys = "";

    // Set the count time.
    if (!someFunctionCalled && !insertMode && /^\d$/.test(key)) {
      times = (times || 0) * 10 + Number(key);
    }

    // If some function invoked and a key pressed, reset the count
    // but don't reset it if no key pressed, this should means the function is invoked by runLastCommand.
    if (someFunctionCalled && key) times = 0;

    // if Vrome is enabled and any functions executed.
    if (e && someFunctionCalled && !disableVrome && !pass_next_key) {
      // skip press Enter in insertMode (used to submit form)
      if (!(isAcceptKey(key) && insertMode)) {
				stopPropagation(e)
      }
    }

		// Compatible with google's new interface
		if (key && key.match(/^.$/) && !insertMode) {
			stopPropagation(e)
		}
  }

	function stopPropagation(e) {
		e.stopPropagation();
		e.preventDefault();
	}

	function exec(e) {
		var key        = getKey(e);

    var insertMode = (/^INPUT|TEXTAREA|SELECT$/i.test(e.target.nodeName) || e.target.getAttribute('contenteditable') != null);

		if (/^(Control|Alt|Shift)$/.test(key)) return;
		currentKeys += key;

    // if vrome set disabled or pass the next, use <C-Esc> to enable it.
		if ((pass_next_key || disableVrome) && !insertMode) {
      if (pass_next_key || isCtrlEscapeKey(key)) enable();
			return;
		}

    currentKeys = filterKey(currentKeys, insertMode); //FIXME multi modes
    if (ignoreKey(currentKeys, insertMode)) { return; }
    runCurrentKeys(currentKeys, insertMode, e);
	}

	return {
    add     : add,
    exec    : exec,
    reset   : reset,
    enable  : enable,

    init    : init,
    times   : getTimes,

    disable : disable,
    passNextKey : passNextKey,

    runLast : runLast,

		stopPropagation : stopPropagation
  };
})();
