var InsertMode = (function(){
  var caret_position,value;

  function currentElement() {
    var elem = document.activeElement;
    caret_position = elem.selectionEnd;
    value = elem.value;
    return elem;
  }

	function blurFocus(){
		currentElement().blur();
	}

	function focusFirstTextInput(){
		var elems = document.querySelectorAll('input[type="text"],input[type="search"],input:not([type])');
		var elem  = elems[times() - 1];
    if(!elem) return;

    elem.focus();
    elem.setSelectionRange(0,elem.value.length);
	}

	function moveToFirstOrSelectAll(){
		var elem = currentElement();
    elem.setSelectionRange(0,caret_position == 0 ? value.length : 0);
	}

	function moveToEnd(){
		var elem = currentElement();
		elem.setSelectionRange(value.length, value.length);
	}

	function deleteForwardChar(){
		var elem = currentElement();
		elem.value = value.substr(0,caret_position) + value.substr(caret_position + 1);
		elem.setSelectionRange(caret_position, caret_position);
	}

	function deleteBackwardChar(){
		var elem = currentElement();
		elem.value = value.substr(0,caret_position - 1) + value.substr(caret_position);
		elem.setSelectionRange(caret_position - 1, caret_position - 1);
	}

	function deleteBackwardWord(){
		var elem = currentElement();
		elem.value = value.substr(0,caret_position).replace(/[^\s\n.,]*?.\s*$/,'') + value.substr(caret_position);
		var position = elem.value.length - (value.length - caret_position);
		elem.setSelectionRange(position,position);
	}

	function deleteForwardWord(){
		var elem = currentElement();
		elem.value = value.substr(0,caret_position) + value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/,'');
		elem.setSelectionRange(caret_position,caret_position);
	}

  function deleteToBegin(){
		var elem = currentElement();
		elem.value = value.substr(caret_position);
		elem.setSelectionRange(0,0);
  }

  function deleteToEnd(){
		var elem = currentElement();
		elem.value = value.substr(0,caret_position);
		elem.setSelectionRange(elem.value.length,elem.value.length);
  }

  function MoveBackwardWord() {
		var elem = currentElement();
		var str = value.substr(0,caret_position).replace(/[^\s\n.,]*?.\s*$/,'');
		elem.setSelectionRange(str.length,str.length);
  }

  function MoveForwardWord() {
		var elem = currentElement();
		var position = value.length - value.substr(caret_position).replace(/^\s*.[^\s\n.,]*/,'').length;
		elem.setSelectionRange(position,position);
  }

  function MoveBackwardChar(){
		var elem = currentElement();
		elem.setSelectionRange(caret_position - 1,caret_position - 1);
  }

  function MoveForwardChar(){
		var elem = currentElement();
		elem.setSelectionRange(caret_position + 1,caret_position + 1);
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

    deleteToBegin          : deleteToBegin          ,
    deleteToEnd            : deleteToEnd            ,
    MoveBackwardWord       : MoveBackwardWord       ,
    MoveForwardWord        : MoveForwardWord        ,
    MoveBackwardChar       : MoveBackwardChar       ,
    MoveForwardChar        : MoveForwardChar        ,
  }
})()
