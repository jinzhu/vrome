var Page = (function() {
	function execMatch(regexps) {
		elems = document.getElementsByTagName('a');
		for (var i in regexps) {
			for (var cur in elems) {
				if (new RegExp(regexps[i],'i').test((elems[cur].innerText || '').replace(/(^(\n|\s)+|(\s|\n)+$)/,''))) {
					return clickElement(elems[cur]);
				}
			}
		}
	}

  // API
	return {
		next : function() {
			execMatch(Option.get('nextpattern'));
		},
	  prev : function() {
	    execMatch(Option.get('previouspattern'));
    },
		copySelected : function() { Clipboard.copy(getSelected()) }
	};
})();
