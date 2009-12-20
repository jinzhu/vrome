var KeyEvent = (function(){
  var times = 0;
  var disableVimlike,pass_next_key,last_current_keys,last_times;

  function init() {
    document.addEventListener('keydown',KeyEvent.exec, false);
  }

  function returnTimes(/*Boolean*/ read) {
    var old_times = times;
    if(!read) times = 0; // only read,don't reset it
    return old_times;
  }

  ///////////////////////////////////////////////////
  // Last Commands
  ///////////////////////////////////////////////////
  function setLast(/*Array*/ currentKeys,/*Number*/ times){
    times = times || 0;
    Post({action : "setLastCommand",currentKey : currentKeys,times : times });
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
		CmdLine.set({title : ' -- PASS NEXT KEY -- ',timeout : 2000 });
    pass_next_key  = true;
    Post({action : "disable"})
  }

	function disable(){
    Debug("KeyEvent.disable");
		CmdLine.set({title : ' -- PASS THROUGH -- ' });
    disableVimlike = true;
    Post({action : "disable"})
	}

  function enable() {
    Debug("KeyEvent.enable");
    disableVimlike = false;
    pass_next_key  = false;
    reset();
    Post({action : "enable"})
  }

  function changeStatus(disableSite){
    if(typeof disableVimlike == "undefined") disableVimlike = disableSite;
    disableVimlike ? disable() : enable();
  }

  ///////////////////////////////////////////////////
  function runCurrentKeys(keys, insertMode, key) {
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
        matched[i][1].call();
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
		var key        = getKey(e);
		var insertMode = /^INPUT|TEXTAREA$/.test(e.target.nodeName);
		if(/^(Control|Alt|Shift)$/.test(key)) return;
		currentKeys.push(key);

    // if vimlike set disabled/pass the next, use Esc to enable it again.
		if ((pass_next_key || disableVimlike) && !insertMode) {
      if (pass_next_key || key == 'Esc') { enable(); }
			return;
		}

    if (runCurrentKeys(currentKeys,insertMode,key)) e.preventDefault();
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
