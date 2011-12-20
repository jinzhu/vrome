var Page = (function() {
	function execMatch(regexps) {
		elems = document.getElementsByTagName('a');
		for (var i=0; i < regexps.length; i++) {
			for (var j=0; j < elems.length; j++) {
				if (new RegExp(regexps[i], 'i').test((elems[j].innerText || '').replace(/(^(\n|\s)+|(\s|\n)+$)/,''))) {
					return clickElement(elems[j]);
				}
			}
		}
	}

	function copySelected() {
		var text = getSelected();
		Clipboard.copy(text);
		var text = text.length > 80 ? (text.slice(0, 80) + "...") : text;
    CmdBox.set({title : '[Copied]' + text, timeout : 4000});
	}

	return {
		next : function() { execMatch(Option.get('nextpattern')); },
	  prev : function() { execMatch(Option.get('previouspattern')); },
		copySelected : copySelected
	};
})();
