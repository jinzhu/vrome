/**
 * Page
 */

var Page = new Object();

(function(){

	function execMatch(regexps){
		elems = document.getElementsByTagName('a');
		for(var i in regexps){
			for(var cur in elems){
				if(new RegExp(regexps[i],'i').test(elems[cur].innerText)){
					return execSelect(elems[cur]);
				}
			}
		}
	}

  // Public API
	Page.Next = function(){
		execMatch(['(下|后)一页','^\s*Next\s*$','^>$','^More$','(^(>>|››|»))|((»|››|>>)$)'])
	}

	Page.Prev = function(){
		execMatch(['(上|前)一页','^\s*Prev(ious)?\s*$','^<$','(^(<<|‹‹|«))|((<<|‹‹|«)$)'])
	}
})()


//////////////////////////////////////////////////
// PageMode
//////////////////////////////////////////////////
function pageMode(key){
  keyListener({add : key == ']' ? nextPageHandler : prevPageHandler,remove : initKeyBind});
}

function nextPageHandler(e){
  addKeyBind( ']', 'nextPage()', e );
  var pressedKey = get_key(e);
  if (pressedKey != ']'){
    keyListener({add : initKeyBind,remove : nextPageHandler});
  }
}

function prevPageHandler(e){
  addKeyBind( '[', 'prevPage()', e );
  var pressedKey = get_key(e);
  if (pressedKey != '['){
    keyListener({add : initKeyBind,remove : prevPageHandler});
  }
}
