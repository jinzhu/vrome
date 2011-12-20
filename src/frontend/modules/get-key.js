var getKey = (function() {
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
		"U+00BB" : "+",
		"U+002C" : ",",
		"U+00BC" : ",",
		"U+002D" : "-",
		"U+00BD" : "-",
		"U+002E" : ".",
    "U+00BE" : ".",
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
		"U+00BA" : ":",
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
    "U+00C0" : "`",
    "U+00DE" : "'"
	};

	var shiftNums = { "`":"~",
		"1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", "8":"*", "9":"(", "0":")",
		"-":"_", "=":"+", ";":":", "'":"\"", ",":"<", ".":">",  "/":"?",  "\\":"|" };

	function getKey(evt) {
		var key   = keyId[evt.keyIdentifier] || evt.keyIdentifier;
		var ctrl  = evt.ctrlKey ? 'C-' : '';
		var meta  = (evt.metaKey || evt.altKey) ? 'M-' : '';
		var shift = evt.shiftKey ? 'S-' : '';

    if (/^(Enter|Space|BackSpace|Tab|Esc|Home|End|Left|Right|Up|Down|PageUp|PageDown|F(\d\d?))$/.test(key)) {
      return (ctrl || meta || shift) ? ('<' + ctrl+meta+shift+key + '>') : ('<' + key + '>');
    }

		if (evt.shiftKey) {
			if (/^[a-z]$/.test(key)) {
        key = key.toUpperCase();
			}
			if (shiftNums[key]) {
        key = shiftNums[key];
			}
    }
    return (ctrl || meta) ? ('<' + ctrl+meta+key + '>') : key;
	}

	return getKey;
})();
