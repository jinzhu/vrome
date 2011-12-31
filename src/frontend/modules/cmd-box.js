var CmdBox = (function() {
  var box_id        = '_vrome_cmd_box';
  var input_box_id  = '_vrome_cmd_input_box';

	var pressUpFunction   = function(){};
	var pressDownFunction = function(){};
	var pressUp           = function(e) { pressUpFunction.call('',e);  };
	var pressDown         = function(e) { pressDownFunction.call('',e);};

  function blur() {
    cmdBoxInput().blur();
  }

  function cmdBox() {
    var div = document.getElementById(box_id);
    if(!div){
      div = document.createElement('div');
      div.setAttribute('id',box_id);
      document.body.insertBefore(div, document.body.childNodes[0]);
    }
    return div;
  }

  function cmdBoxTitle() {
    return document.querySelector('#_vrome_cmd_box span');
  }

  function createCmdBoxTitle() {
    var cmdbox = cmdBox();
    var span = document.createElement('span');
    cmdbox.appendChild(span);
    return span;
  }

  function cmdBoxInput() {
    return document.querySelector('#_vrome_cmd_box input');
  }

  function createCmdBoxInput() {
    var cmdbox = cmdBox();
    var input = document.createElement('input');
    input.setAttribute('id',input_box_id);
    cmdbox.appendChild(input);
    return input;
  }

  function set(opt) {
    if (opt.title) {
      var title = cmdBoxTitle() || createCmdBoxTitle();
      title.innerText = opt.title;
    }
    if (typeof(opt.content) == 'string') {
      var input = cmdBoxInput() || createCmdBoxInput();
      input.value = opt.content;
      input.setSelectionRange(0, input.value.length);
      input.addEventListener('keydown', pressDown, true);
      input.addEventListener('keyup'  , pressUp, true);
      input.focus();
    }
		if (opt.pressUp)   { pressUpFunction   = opt.pressUp; }
		if (opt.pressDown) { pressDownFunction = opt.pressDown; }
    if (opt.timeout)   { setTimeout(remove, Number(opt.timeout)); }
  }

  function get() {
    return {
      title   : cmdBoxTitle() ? cmdBoxTitle().innerText : '',
      content : cmdBoxInput() ? cmdBoxInput().value     : ''
    };
  }

  function remove() {
		pressUpFunction   = function(){};
		pressDownFunction = function(){};
    var box = document.getElementById(box_id);
    if (box) { document.body.removeChild(box); }
  }

  function isCmdBoxInput(target) {
    return target.getAttribute('id') === input_box_id;
  }

  return { blur : blur, set : set, get : get, remove : remove, isCmdBoxInput : isCmdBoxInput, cmdBox : cmdBox };
})();
