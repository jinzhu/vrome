/**
 * Page
 */

var Page = (function(){

	function execMatch(regexps){
		elems = document.getElementsByTagName('a');
		for(var i in regexps){
			for(var cur in elems){
				if(new RegExp(regexps[i],'i').test(elems[cur].innerText)){
					return clickElement(elems[cur]);
				}
			}
		}
	}

  // Public API
	return {
		next : function(){
			execMatch(['(下|后)一页','^\\s*Next\\s*$','^>$','^More$','(^(>>|››|»))|((»|››|>>)$)']);
		},
	  prev : function(){
	   execMatch(['(上|前)一页','^\\s*Prev(ious)?\\s*$','^<$','(^(<<|‹‹|«))|((<<|‹‹|«)$)']);
    }
	};
})();
