var Clipboard = (function() {
	function copy(/*String*/ value) {
    Post({action : "Clipboard.copy",value : value});
	}

  return {
    copy : copy
  };
})();
