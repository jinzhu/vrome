var InsertMode = (function(){
	function blurFocus(){
		document.activeElement.blur();
	}

	function focusFirstTextInput(){
		var elems = document.querySelectorAll('input[type="text"],input[type="search"],input:not([type])');
		var elem  = elems[times() - 1];
    if(!elem) return;

    elem.focus();
    elem.setSelectionRange(0,elem.value.length);
	}

	function moveToFirstOrSelectAll(){
		var elem = document.activeElement;
		var caret_position = elem.selectionEnd;
    elem.setSelectionRange(0,caret_position == 0 ? elem.value.length : 0);
	}

	function moveToEnd(){
		var elem = document.activeElement;
		elem.setSelectionRange(elem.value.length, elem.value.length);
	}

	function deleteForwardChar(){
		var elem = document.activeElement;
		var caret_position = elem.selectionEnd;
		elem.value = elem.value.substr(0,caret_position) + elem.value.substr(caret_position + 1);
		elem.setSelectionRange(caret_position, caret_position);
	}

	function deleteBackwardChar(){
		var elem = document.activeElement;
		var caret_position = elem.selectionEnd;
		elem.value = elem.value.substr(0,caret_position - 1) + elem.value.substr(caret_position);
		elem.setSelectionRange(caret_position - 1, caret_position - 1);
	}

	function deleteBackwardWord(){
		var elem = document.activeElement;
		var caret_position = elem.selectionEnd;
    var str = elem.value;
		elem.value = str.substr(0,caret_position).replace(/[^\s\n.,]*?.\s*$/,'') + str.substr(caret_position);
		var position = elem.value.length - (str.length - caret_position);
		elem.setSelectionRange(position,position);
	}

	function deleteForwardWord(){
		var elem = document.activeElement;
		var caret_position = elem.selectionEnd;
    var str = elem.value;
		elem.value = str.substr(0,caret_position) + str.substr(caret_position).replace(/^\s*.[^\s\n.,]*/,'');
		elem.setSelectionRange(caret_position,caret_position);
	}

  function deleteToBegin(){
		var elem = document.activeElement;
		elem.value = elem.value.substr(elem.selectionEnd);
		elem.setSelectionRange(0,0);
  }

  function deleteToEnd(){
		var elem = document.activeElement;
		elem.value = elem.value.substr(0,elem.selectionEnd);
		elem.setSelectionRange(elem.value.length,elem.value.length);
  }

  return {
    blurFocus              : blurFocus              ,
    focusFirstTextInput    : focusFirstTextInput    ,

    moveToFirstOrSelectAll : moveToFirstOrSelectAll ,
    moveToEnd              : moveToEnd              ,
    deleteForwardChar      : deleteForwardChar      ,
    deleteBackwardChar     : deleteBackwardChar     ,
    deleteForwardWord      : deleteForwardWord      ,
    deleteBackwardWord     : deleteBackwardWord     ,

    deleteToBegin : deleteToBegin,
    deleteToEnd   : deleteToEnd,
  }
})()
