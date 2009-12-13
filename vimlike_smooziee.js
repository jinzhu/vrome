//////////////////////////////////////////////////
// Notice
//////////////////////////////////////////////////
function notice(opt){
  if(opt){
    // find or create a element
    var title = document.getElementById('vimlike_smooziee_notice_title') || document.createElement('div');
    title.setAttribute('id','vimlike_smooziee_notice_title');
    title.style.position   = "fixed";
    title.style.bottom     = "0";
    title.style.right      = "0";
    title.style.width      = "250px";
    title.style.background = "#ff0";
    title.style.textAlign  = "left";
    title.style.fontSize   = "10px";
    title.style.color      = "green";
    title.style.fontWeight = "bold";
    title.style.padding    = "2px";
    title.style.paddingLeft= "10px";
    title.style.border     = "thin solid #f00";
    title.style.zIndex     = "100000";
    if(opt.title){
      // set notice title if has
      title.innerHTML      = opt.title;
    }

    // find or create a element
    var content = document.getElementById('vimlike_smooziee_notice_content') || document.createElement('span');
    content.setAttribute('id','vimlike_smooziee_notice_content');
    content.style.color      = "#000";
    content.style.padding    = "5px";
    content.innerHTML        = opt.content ? opt.content : (content.innerText);

    title.appendChild(content);
    document.body.appendChild(title);
  }else{
    return { title : document.getElementById('vimlike_smooziee_notice_title').firstChild.data , content : document.getElementById('vimlike_smooziee_notice_content').innerText }
  }
}

function removeNotice(){
  var notice = document.getElementById('vimlike_smooziee_notice_title');
  if(notice){ document.body.removeChild(notice); }
}

//////////////////////////////////////////////////
// History
//////////////////////////////////////////////////
function historyBack(){
  history.back();
}

function historyForward(){
  history.forward();
}

//////////////////////////////////////////////////
// gMode
//////////////////////////////////////////////////
function gMode(){
  keyListener({add : gHandler,remove : initKeyBind});
}

function gHandler(e){
  addKeyBind( 'g', 'scrollToTop()', e );
  addKeyBind( 'i', 'focusFirstTextInput()', e );
  var pressedKey = get_key(e);
  if (pressedKey != 'g' && pressedKey != 'i'){
    keyListener({add : initKeyBind,remove : gHandler});
  }
}

////////////////////

function enableVimlike(){
  removeNotice();
  keyListener({add : initKeyBind });
  localStorage.removeItem('disableVimlike');
}

function passMode(){
    notice({title : ' -- PASS THROUGH -- '});
    keyListener({add : passModeHandle,remove : initKeyBind});
    localStorage.disableVimlike = true;
}

function passModeHandle(e){
  addKeyBind( 'Esc', 'enableVimlike()', e );
}


function runLastSetting(){
  if(document.body){
    if(localStorage.disableVimlike){ passMode(); }
    if(localStorage.vimlike_zoom){ setZoom(localStorage.vimlike_zoom); }
  }else{
    setTimeout(runLastSetting,100);
  }
}

enableVimlike();
runLastSetting();
