var CmdLine = (function(){
  var box_id        = '__vrome_cmd_box';
  var input_box_id  = '__vrome_cmd_input_box';

	var pressUpFunction   = function(){};
	var pressDownFunction = function(){};
  var enterFunction     = function(){};
	var pressUp           = function(e) { pressUpFunction.call('',e);  };
	var pressDown         = function(e) { pressDownFunction.call('',e);};
  var enter = function(e) { if(getKey(e) == 'Enter') enterFunction.call('',e); }

  function createCmdBox(){
    var box = document.createElement('div');
    box.setAttribute('id',box_id);
    document.body.appendChild(box);
  }

  function cmdBoxExist(){
    return !!document.getElementById(box_id);
  }

  function cmdBox() {
    if(!cmdBoxExist()) createCmdBox();
    return document.getElementById(box_id);
  }

  function createInputBox(){
    var box = document.createElement('input');
    box.setAttribute('id',input_box_id);
    box.setAttribute('type','text');
    cmdBox().appendChild(box);

    cmdBox().addEventListener('keydown',pressDown,false);
    cmdBox().addEventListener('keydown',enter  ,false);
    cmdBox().addEventListener('keyup'  ,pressUp,false);
  }

  function inputBoxExist(){
    return !!document.getElementById(input_box_id);
  }

  function inputBox() {
    if(!inputBoxExist()) createInputBox();
    return document.getElementById(input_box_id);
  }

  function set(opt){
    if(opt.title)
      cmdBox().firstChild ? cmdBox().firstChild.data = opt.title : cmdBox().innerHTML = opt.title;
    if(typeof(opt.content) == 'string'){
      elem = inputBox();
      elem.value = opt.content;
      elem.focus();
      elem.setSelectionRange(0,elem.value.length);
    }
		if(opt.pressUp)
      pressUpFunction = opt.pressUp;
    if(opt.pressDown)
      pressDownFunction = opt.pressDown;
    if(opt.enter)
      enterFunction = opt.enter;
    if(opt.timeout)
      setTimeout(remove,Number(opt.timeout));
  }

  function get(){
    return {
      title   : cmdBoxExist ? cmdBox().firstChild.data : '',
      content : inputBoxExist ? inputBox().value       : '',
    };
  }

  function remove(){
		pressUpFunction   = function(){};
		pressDownFunction = function(){};
    enterFunction     = function(){};
    var box = document.getElementById(box_id);
    if(box) document.body.removeChild(box);
  }

  return { set : set, get : get, remove : remove };
})()
