var CmdLine = (function(){
  var box_id        = '__vimlike_cmd_box';
  var input_box_id  = '__vimlike_cmd_input_box';
	var pressUpFunction   = function(){};
	var pressDownFunction = function(){};

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
    cmdBox().addEventListener('keydown',pressDown,false)
    cmdBox().addEventListener('keyup',pressUp,false)
  }
	function pressUp()   { pressUpFunction.call(); }
	function pressDown() { pressDownFunction.call(); }

  function inputBoxExist(){
    return !!document.getElementById(input_box_id);
  }

  function inputBox() {
    if(!inputBoxExist()) createInputBox();
    return document.getElementById(input_box_id);
  }

  function remove(){
		pressUpFunction   = function(){};
		pressDownFunction = function(){};

		if(cmdBoxExist()){
			cmdBox().removeEventListener('keydown',pressDown,false)
			cmdBox().removeEventListener('keydown',pressUp,false)
		}

    var div = document.getElementById(box_id);
    if(div) document.body.removeChild(div);
  }

  function set(opt){
		if(opt.pressUp)
      pressUp = opt.pressUp;
    if(opt.pressDown)
      pressDown = opt.pressDown;
    if(opt.title)
      cmdBox().firstChild ? cmdBox().firstChild.data = opt.title : cmdBox().innerHTML = opt.title;
    if(typeof(opt.content) == 'string')
      inputBox().value = opt.content;
  }

  function get(){
    return {
      title   : cmdBoxExist ? cmdBox().firstChild.data : '',
      content : inputBoxExist ? inputBox().value       : '',
    };
  }

  return { set : set, get : get, remove : remove };
})()
