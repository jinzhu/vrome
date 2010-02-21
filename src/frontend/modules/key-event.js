var KeyEvent = (function() {
  var times = 0;
  var disableVrome, pass_next_key, last_current_keys, last_times;

  function init() {
    // disable site
    var disable_sites = Option.get("disablesites").split(", ");
    for (var i = 0; i < disable_sites.length ; i++) {
      if (disable_sites[i] && new RegExp(disable_sites[i],'i').test(location.href)) {
        disableVrome = true;
        break;
      }
    }

    document.addEventListener('keydown',KeyEvent.exec, false);
  }

  function getTimes(/*Boolean*/ read) {
    var origin_times = times;
    if(!read) times = 0; // reset it except only read
    return origin_times;
  }

  ///////////////////////////////////////////////////
  // Last Commands
  ///////////////////////////////////////////////////
  function storeLast(/*Array*/ currentKeys,/*Number*/ times) {
    times = times || 0;
    Post({action : "storeLastCommand",currentKeys : currentKeys,times : times});
    last_current_keys = currentKeys;
    last_times        = times;
    Debug("KeyEvent.storeLastCommand - currentKeys:" + currentKeys + " times:" + times);
  }

  function runLast() {
    runCurrentKeys(last_current_keys);
  }

  ///////////////////////////////////////////////////
	var bindings    = [];
	var currentKeys = "";

	function add(/*String*/ keys,/*Function*/ fun,/*Boolean*/ input) {
		bindings.push([keys,fun,!!input]);
	}

	function reset() {
		currentKeys = "";
	}

  ///////////////////////////////////////////////////
  function passNextKey() {
		CmdBox.set({title : ' -- PASS THROUGH (next) -- ',timeout : 2000 });
    pass_next_key  = true;
    Post({action : "Vrome.disable"})
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
  function filterKey(key,insertMode) {
    var configure = Settings.get('background.configure');
    var mode = insertMode ? 'imap' : 'map';
    if (/\d/.test(key)) { return key; }
    return (configure[mode] && configure[mode][key]) || key;
  }

  function runCurrentKeys(keys, insertMode, e) {
    var key = getKey(e);
		// FIXME run last command
    if (key == '.' && !insertMode) {
			var old_times = last_times;
			times = (last_times || 1) * (times || 1);
		// some key pressed
		} else if (key && !insertMode) {
			var old_times = times;
		}

		for (var i = 0; i < bindings.length; i++) {
      // insertMode or not
      if (!!insertMode != bindings[i][2]) continue;

      // escape regexp
      var regexp = new RegExp('^(' + bindings[i][0].replace(/([(\[{\\^$|)?*+.])/g,"\\$1") + ')');
      if (regexp.test(keys)) {
        var someFunctionCalled = true;
        keys.replace(regexp,'');
        bindings[i][1].call(e);
      }

      var regexp = new RegExp('^(' + keys.replace(/([(\[{\\^$|)?*+.])/g,"\\$1") + ')');
      if (regexp.test(bindings[i][0])) {
        var someBindingMatched = true;
      }
		}

    // store current command
    if (someFunctionCalled && key != '.' && !insertMode) {
      storeLast(currentKeys, old_times);
    }
    if (!someBindingMatched || someFunctionCalled) reset();

    if (!insertMode && /\d/.test(key)) {
      times = (times || 0) * 10 + Number(key);
    } else {
      // if some function executed and some key pressed, reset the times
      // no key perssed always means,this function is invoked by runLastCommand.
      if (someFunctionCalled && key) times = 0;
    }

    // if any command executed,and the key is not Enter in insertMode (submit form)
    if (someFunctionCalled && !(key == '<Enter>' && insertMode)) e.preventDefault();
  }

	function exec(e) {
		var key        = getKey(e);
    if (isEscapeKey(key)) return enable();

		var insertMode = /^INPUT|TEXTAREA$/i.test(e.target.nodeName);
		if (/^<(Control|Alt|Shift)>$/.test(key)) return;
		currentKeys += key;

    // if vrome set disabled/pass the next, use Esc to enable it again.
		if ((pass_next_key || disableVrome) && !insertMode) {
      if (pass_next_key || key == '<Esc>')  enable();
			return;
		}

    currentKeys = filterKey(currentKeys,insertMode); //FIXME multi modes
    runCurrentKeys(currentKeys,insertMode,e);
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
  };
})();
