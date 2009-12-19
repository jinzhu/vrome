var KeyEvent = (function(){
  var times = 0;
  var disableVimlike,pass_next_key,last_current_keys,last_times;

  function init() {
    document.addEventListener('keydown',KeyEvent.exec, false);
  }

  function returnTimes(/*Boolean*/ read) {
    var result = times;
    if(!read) times = 0; // only read.
    return result;
  }

  ///////////////////////////////////////////////////
  // Last Commands
  ///////////////////////////////////////////////////
  function setLast(opt){
    if(opt.currentKeys) last_current_keys = opt.currentKeys;
    if(opt.times)       last_times        = opt.times;
  }

  function storeLast(currentKeys,times){
    var port = chrome.extension.connect();
    port.postMessage({action: "storeLastCommand",currentKey : currentKeys,times: times});
    last_current_keys = currentKeys;
    last_times        = times;
    Debug("KeyEvent.storeLast - currentKeys:" + currentKeys + " times:" + times);
  }

  function runLast(){
    times = last_times;
    runCurrentKeys(last_current_keys);
    times = 0;
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
  }

	function disable(){
    Debug("KeyEvent.disable");
		CmdLine.set({title : ' -- PASS THROUGH -- ' });
    disableVimlike = true;
    var port = chrome.extension.connect();
    port.postMessage({action: "disable"});
	}

  function enable() {
    Debug("KeyEvent.enable");
    disableVimlike = false;
    pass_next_key  = false;
    reset();
    var port = chrome.extension.connect();
    port.postMessage({action: "enable"});
  }

  function changeStatus(disableSite){
    if(typeof disableVimlike == "undefined") disableVimlike = disableSite;
    disableVimlike ? disable() : enable();
  }
  ///////////////////////////////////////////////////

  function runCurrentKeys(keys,insertMode) {
		var matched = [];

		binding : for(var i in bindings){
      // in insertMode or not
      if(!!insertMode != bindings[i][2]) continue binding;

      // part matched bindings.
			for(var j in keys){
				if(keys[j] != bindings[i][0][j]) continue binding;
			}
			matched.push(bindings[i]);
		}

    var exec = 0;
    for(var i in matched){
      // execute those exactly matched bindings
			if(matched[i][0].length == keys.length){
        matched[i][1].call();
        exec++;
			}
		}

    Debug("KeyEvent.runCurrentKeys - keys:" + keys + " insertMode:" + insertMode + " times:" + times + " matched:" + matched.length + " exec:" + exec);
    return {match : matched.length, exec : exec};
  }

	function exec(e){
		var key        = getKey(e);
		var insertMode = /^INPUT|TEXTAREA$/.test(e.target.nodeName);
		if(/^(Control|Alt|Shift)$/.test(key)) return;
		currentKeys.push(key);

    if(key == 'Esc') CmdLine.remove();

    // if vimlike set disabled/pass the next, use Esc to enable it again.
		if((pass_next_key || disableVimlike) && !insertMode){
      if(key == 'Esc'){ enable(); }
			return;
		}

    // store current command before run
    if(key != '.') storeLast(currentKeys,times);

    var result = runCurrentKeys(currentKeys,insertMode);
    // if any command executed,and the key is not insertMode Enter (used to submit form)
    if(result.exec > 0 && !(key == 'Enter' && insertMode)) e.preventDefault();


    // not in insertMode,key is not number,some func matched,set time to 0
    if (!insertMode && /\d/.test(key)){
      times = times * 10 + Number(key);
    }else{
      if(result.exec != 0) times = 0;
    }

    // all matched bindings has been executed,or the key is Esc.
		if(result.match == result.exec || key == 'Esc'){ reset(); }
	}

	return {
    add     : add,
    exec    : exec,

    init    : init,
    times   : function(/*Boolean*/ read){ return returnTimes(read) },

    disable : disable,
    enable  : enable,
    passNextKey    : passNextKey,
    changeStatus   : changeStatus,

    setLast : setLast,
    runLast : runLast,
  };
})();
