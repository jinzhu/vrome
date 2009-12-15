var Clipboard = (function(){
  function createTextArea(/*String*/ data) {
    var textNode = document.createElement('textarea'); 
    textNode.style.position = "fixed"; 
    textNode.style.left = "-1000%"; 

    textNode.value = data; 
    document.body.appendChild(textNode); 
    return textNode; 
  }; 

	function yankCopy(/*String*/ data,/*Boolean*/ copy){
      if (data == null) return; 
      var textNode = createTextArea(data);
      textNode.select();
      if (copy) document.execCommand('Copy');
      document.body.removeChild(textNode); 
	}

  return {
		yank : function(data) { yankCopy(data) },
    copy : function(data) { yankCopy(data,true) }
  }
})()
