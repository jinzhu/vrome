var KeyEvent = (function(){
  var times = 0;
  var disableVimlike = !!localStorage._disableVimlike;
  var pass_next_key;

  function init(){
    if(disableVimlike) disable();
    document.addEventListener('keydown',exec, false);
  }

	var keyId = {
		"U+0008" : "BackSpace",
		"U+0009" : "Tab",
		"U+0018" : "Cancel",
		"U+001B" : "Esc",
		"U+0020" : "Space",
		"U+0021" : "!",
		"U+0022" : "\"",
		"U+0023" : "#",
		"U+0024" : "$",
		"U+0026" : "&",
		"U+0027" : "'",
		"U+0028" : "(",
		"U+0029" : ")",
		"U+002A" : "*",
		"U+002B" : "+",
		"U+002C" : ",",
		"U+002D" : "-",
		"U+002E" : ".",
		"U+002F" : "/",
		"U+00BF" : "/",
		"U+0030" : "0",
		"U+0031" : "1",
		"U+0032" : "2",
		"U+0033" : "3",
		"U+0034" : "4",
		"U+0035" : "5",
		"U+0036" : "6",
		"U+0037" : "7",
		"U+0038" : "8",
		"U+0039" : "9",
		"U+003A" : ":",
		"U+003B" : ";",
		"U+003C" : "<",
		"U+003D" : "=",
		"U+003E" : ">",
		"U+003F" : "?",
		"U+0040" : "@",
		"U+0041" : "a",
		"U+0042" : "b",
		"U+0043" : "c",
		"U+0044" : "d",
		"U+0045" : "e",
		"U+0046" : "f",
		"U+0047" : "g",
		"U+0048" : "h",
		"U+0049" : "i",
		"U+004A" : "j",
		"U+004B" : "k",
		"U+004C" : "l",
		"U+004D" : "m",
		"U+004E" : "n",
		"U+004F" : "o",
		"U+0050" : "p",
		"U+0051" : "q",
		"U+0052" : "r",
		"U+0053" : "s",
		"U+0054" : "t",
		"U+0055" : "u",
		"U+0056" : "v",
		"U+0057" : "w",
		"U+0058" : "x",
		"U+0059" : "y",
		"U+005A" : "z",
		"U+005B" : "[",
		"U+005C" : "\\",
		"U+005D" : "]",
		"U+00DB" : "[",
		"U+00DC" : "\\",
		"U+00DD" : "]",
		"U+005E" : "^",
		"U+005F" : "_",
		"U+0060" : "`",
		"U+007B" : "{",
		"U+007C" : "|",
		"U+007D" : "}",
		"U+007F" : "Delete",
		"U+00A1" : "¡",
		"U+0300" : "CombAcute",
		"U+0302" : "CombCircum",
		"U+0303" : "CombTilde",
		"U+0304" : "CombMacron",
		"U+0306" : "CombBreve",
		"U+0307" : "CombDot",
		"U+0308" : "CombDiaer",
		"U+030A" : "CombRing",
		"U+030B" : "CombDblAcute",
		"U+030C" : "CombCaron",
		"U+0327" : "CombCedilla",
		"U+0328" : "CombOgonek",
		"U+0345" : "CombYpogeg",
		"U+20AC" : "€",
		"U+3099" : "CombVoice",
		"U+309A" : "CombSVoice",
    "U+00C0" : "`",
	};

	var shiftNums = { "`":"~",
		"1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", "8":"*", "9":"(", "0":")",
		"-":"_", "=":"+", ";":":", "'":"\"", ",":"<", ".":">",  "/":"?",  "\\":"|" };

	function getKey(evt){
		var key = keyId[evt.keyIdentifier] || evt.keyIdentifier,
		ctrl = evt.ctrlKey ? 'C-' : '',
		meta = (evt.metaKey || evt.altKey) ? 'M-' : '',
		shift = evt.shiftKey ? 'S-' : '';

		if (evt.shiftKey){
			if (/^[a-z]$/.test(key)){
				return ctrl+meta+key.toUpperCase();
			}
			if (shiftNums[key]){
				return ctrl+meta+shiftNums[key];
			}
			if (/^[0-9]$/.test(key)) {
				if(key == "4") key = "$";
				return key;
			}
			if (/^(Enter|Space|BackSpace|Tab|Esc|Home|End|Left|Right|Up|Down|PageUp|PageDown|F(\d\d?))$/.test(key)){
				return ctrl+meta+shift+key;
			}
		}
		return ctrl+meta+key;
	}

	var bindings    = [];
	var currentKeys = [];

	function sameArray(x, y) {
		if(!(x instanceof Array && y instanceof Array)) return false;

		var len = 0;
		for(var i in x) {
			if(x[i] instanceof Array){
				if(!sameArray(x[i],y[i])) return false;
			}else{
				if(x[i] != y[i]) return false;
			}
			len++;
		}
		return y.length == len;
	}

	function add(/*Array*/ keys,/*Function*/ fun,/*Boolean*/ input){
		if(typeof keys == 'string'){ keys = Array(keys); }
		bindings.push([keys,fun,!!input]);
	}

	function remove(/*Array*/ keys,/*Function*/ fun,/*Boolean*/ input){
		if(typeof keys == 'string'){ keys = Array(keys); }
		for(var i in bindings){
			if(sameArray(bindings[i],[keys,fun,!!input])) return bindings.splice(i,1);
		}
	}

	function exec(e){
		key = getKey(e);
    if(key == 'Esc') CmdLine.remove();
		if(/^(Control|Alt|Shift)$/.test(key)) return;

    if(pass_next_key) {
      pass_next_key = false;
      reset();
      return false;
    }

		if(disableVimlike){
			if(key == 'Esc'){
        localStorage.removeItem('_disableVimlike');
        disableVimlike = false;
      }
			reset();
			return false;
		}

		currentKeys.push(key);
    var inputMode = /^INPUT|TEXTAREA$/.test(e.target.nodeName);
		Debug('handling key: ' + currentKeys.join(', ') + " inputMode:" + inputMode);

		var matched = [];

		binding : for(var i in bindings){
      if(inputMode != bindings[i][2]) continue binding;

			for(var j in currentKeys){
				if(currentKeys[j] != bindings[i][0][j]) continue binding;
			}
			matched.push(bindings[i]);
		}

		// TODO notices matched functions, pass arguments
    var exec_length = 0;
    for(var i in matched){
			if(matched[i][0].length == currentKeys.length){
        var exec_time = (times > 0 && key != '%') ? times : 1;
        Debug('Invoke ' + exec_time + ' Times');
        for(var t = 0; t < exec_time; t++) {
          matched[i][1].call();
        }
        exec_length++;
        e.preventDefault();
			}
		}

    // Times
    times = (!inputMode && /\d/.test(key)) ? (times * 10 + Number(key)) : 0;

		if(matched.length == exec_length || key == 'Esc'){ reset(); }
    return false;
	}

	function reset(){
    times = 0;
		currentKeys = [];
	}

	function disable(){
		CmdLine.set({title : ' -- PASS THROUGH -- ' });
		localStorage._disableVimlike = true;
    disableVimlike = true;
	}

  function passNextKey(){
		CmdLine.set({title : ' -- PASS NEXT KEY -- ',timeout : 2000 });
    pass_next_key  = true;
  }

	return {
    add : add, exec : exec, remove : remove,getKey : getKey, disable : disable, init : init,
    times : function(){ return times; }, passNextKey : passNextKey
  };
})();
