var Clipboard = (function(){
  function createTextArea(data) { 
    var textNode = document.createElement('textarea'); 
    textNode.style.position = "fixed"; 
    textNode.style.left = "-1000%"; 

    textNode.value = data; 
    document.body.appendChild(textNode); 
    return textNode; 
  }; 

  return {
    copy : function(data){
      if (data == null) return; 
      var textNode = createTextArea(data);
      textNode.select();
      document.execCommand('Copy'); 
      document.body.removeChild(textNode); 
    }
  }
})()
