var CmdLine = (function(){
  var box_id       = '__vimlike_cmd_box'
  var input_box_id = '__vimlike_cmd_input_box'

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
  }

  function inputBoxExist(){
    return !!document.getElementById(input_box_id);
  }

  function inputBox() {
    if(!inputBoxExist()) createInputBox();
    return document.getElementById(input_box_id);
  }

  function remove(){
    try{ document.body.removeChild(document.getElementById(box_id)); }catch(e){};
  }

  function set(opt){
    if(opt.title)
      cmdBox().firstChild ? cmdBox().firstChild.data = opt.title :
        cmdBox().innerHTML = opt.title;
    if(opt.content)
      inputBox().value = opt.content;
    return get();
  }

  function get(){
    return {
      title   : cmdBoxExist ? cmdBox().firstChild.data : null,
      content : inputBoxExist ? inputBox().value : null
    };
  }

  return { set : set, get : get, remove : remove };
})()
