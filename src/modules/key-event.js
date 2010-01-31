var KeyEvent = (function(){
  var times = 0;
  var disableVrome, pass_next_key, last_current_keys, last_times, disable_site;

  function init() {
    // TODO first time user?
    var hotkeys = Settings.get('background.hotkeys');
    for(var i = 0;i < hotkeys.length; i++) {
      try {
        var hotkey = hotkeys[i];
        var actions = hotkey[1].split('.');
        var action  = window[actions.shift()];
        while (action && actions[0]) { action = action[actions.shift()]; }
        if (hotkey[2] == 'normalMode') {
          add(hotkey[0].split('+'), action);
        } else if (hotkey[2] == 'insertMode') {
          add(hotkey[0].split('+'), action, true);
        } else if (hotkey[2] == 'commandMode') {
          CmdLine.add(hotkey[0],action);
        }
      } catch(e) {
        continue;
      }
    }

    document.addEventListener('keydown',KeyEvent.exec, false);
  }

  function returnTimes(/*Boolean*/ read) {
    var old_times = times;
    if(!read) times = 0; // reset it except only read
    return old_times;
  }

  ///////////////////////////////////////////////////
  // Last Commands
  ///////////////////////////////////////////////////
  function setLast(/*Array*/ currentKeys,/*Number*/ times) {
    times = times || 0;
    Post({action : "setLastCommand",currentKey : currentKeys,times : times});
    last_current_keys = currentKeys;
    last_times        = times;
    Debug("KeyEvent.setLast - currentKeys:" + currentKeys + " times:" + times);
  }

  function runLast(){
    runCurrentKeys(last_current_keys);
  }

  ///////////////////////////////////////////////////
	var bindings    = [];
	var currentKeys = [];

	function add(/*Array*/ keys,/*Function*/ fun,/*Boolean*/ input){
		if(typeof keys == 'string'){ keys = Array(keys); }
		bindings.push([keys,fun,!!input]);
	}

	function reset(){
		currentKeys = [];
	}

  ///////////////////////////////////////////////////
  function passNextKey(){
		CmdBox.set({title : ' -- PASS THROUGH (next) -- ',timeout : 2000 });
    pass_next_key  = true;
    Post({action : "Vrome.disable"})
  }

	function disable(){
    Debug("KeyEvent.disable");
		CmdBox.set({title : ' -- PASS THROUGH -- ' });
    disableVrome = true;
    Post({action : "Vrome.disable"})
	}

  function enable() {
    Debug("KeyEvent.enable");
    CmdBox.remove();
    disableVrome = false;
    pass_next_key  = false;
    reset();
    Post({action : "Vrome.enable"})
  }

  function changeStatus(/*Boolean*/ enableStatus) {
		if (typeof enableStatus == "boolean") {
			disableVrome = !enableStatus;
      disable_site = disableVrome;

		} else if (typeof disableVrome == "undefined") {
			var disable_sites = Settings.get('background.disableSites');

			for (var i in disable_sites) {
				if (disable_sites[i] && disable_sites[i]) {
					if (new RegExp(disable_sites[i],'i').test(location.href)) {
						disableVrome = true;
            disable_site = true;
						break;
					}
				}
			}
		}

    disableVrome ? disable() : enable();
  }

  ///////////////////////////////////////////////////
  function runCurrentKeys(keys, insertMode, key,e) {
		// run last command
    if(key == '.' && !insertMode){
			var old_times = last_times;
			times = (last_times || 1) * (times || 1);
		// some key pressed
		}else if(key && !insertMode){
			var old_times = times;
		}

		var matched = [];

		binding : for(var i in bindings){
      // insertMode or not
      if(!!insertMode != bindings[i][2]) continue binding;

      // part matched bindings.
			for(var j in keys){
				if(keys[j] != bindings[i][0][j]) continue binding;
			}
			matched.push(bindings[i]);
		}

    var exec_length = 0;
    for(var i in matched){
      // execute those exactly matched bindings
			if(matched[i][0].length == keys.length){
        matched[i][1].call(e);
        exec_length++;
			}
		}

    Debug("KeyEvent.runCurrentKeys - keys:" + keys + " insertMode:" + insertMode + " times:" + old_times + " matched:" + matched.length + " exec:" + exec_length);

    // store current command
    if(exec_length > 0 && key != '.' && !insertMode) setLast(keys,old_times);

    // if currentMode is not insertMode,and the key is a number,update times.
    if (!insertMode && /\d/.test(key)){
      times = (times || 0) * 10 + Number(key);
    }else{
      // if some function executed and some key pressed, reset the times
      // no key perssed always means,this function is invoked by runLastCommand.
      if(exec_length != 0 && key) times = 0;
    }

    // reset if all matched bindings has been executed,or the key is Esc,or no key
		if(matched.length == exec_length || key == 'Esc' || !key){ reset(); }

    // if any command executed,and the key is not Enter in insertMode (submit form)
    return (exec_length > 0 && !(key == 'Enter' && insertMode));
  }

	function exec(e) {
    if(disable_site) return; // if this url belong to disabled sites,do nothing
		var key        = getKey(e);
		var insertMode = /^INPUT|TEXTAREA$/i.test(e.target.nodeName);
		if(/^(Control|Alt|Shift)$/.test(key)) return;
		currentKeys.push(key);

    // if vrome set disabled/pass the next, use Esc to enable it again.
		if ((pass_next_key || disableVrome) && !insertMode) {
      if (pass_next_key || key == 'Esc') { enable(); }
			return;
		}

    if (runCurrentKeys(currentKeys,insertMode,key,e)) e.preventDefault();
	}

	return {
    add     : add,
    exec    : exec,

    init    : init,
    times   : function(/*Boolean*/ read){ return returnTimes(read) },

    disable : disable,
    passNextKey    : passNextKey,
    changeStatus   : changeStatus,

    setLast : setLast,
    runLast : runLast,
  };
})();

KeyEvent.disable.normalMode     = true;
KeyEvent.passNextKey.normalMode = true;
KeyEvent.runLast.normalMode     = true;
