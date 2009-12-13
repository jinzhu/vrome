// vim:ft=javascript

function extend(to,from) {
  if (!to) to = {};
  for(var p in from) to[p] = from[p];
  return to;
}

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    var tab = port.tab;
    switch(msg.action){
    case "remove_hints":
      removeHints();
      break;
    }
  });
});

function keyListener(arg){
  if(arg.add){
    document.addEventListener('keydown', arg.add, false);
  }
  if(arg.remove){
    document.removeEventListener('keydown', arg.remove, false);
  }
}
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

function focusFirstTextInput(){
  var elem = document.querySelector('input[type="text"],input:not([type])');
  if (elem) {
    elem.focus();
    elem.setSelectionRange(0,elem.value.length);
  }
  keyListener({add : initKeyBind,remove : gHandler});
}

function blurFocus(){
  document.activeElement.blur();
}

function moveFirstOrSelectAll(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  if (caret_position == 0){
    elem.setSelectionRange(0, elem.value.length); // select all text
  }else{
    elem.setSelectionRange(0, 0);
  }
}

function moveEnd(){
  var elem = document.activeElement;
  elem.setSelectionRange(elem.value.length, elem.value.length);
}

function moveForward(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  elem.setSelectionRange(caret_position + 1, caret_position + 1);
}

function moveBackward(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  elem.setSelectionRange(caret_position - 1, caret_position - 1);
}

function deleteForward(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  var org_str = elem.value;
  elem.value = org_str.substring(0, caret_position) + org_str.substring(caret_position + 1, org_str.length);
  elem.setSelectionRange(caret_position, caret_position);
}

function deleteBackward(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  var org_str = elem.value;
  elem.value = org_str.substring(0, caret_position - 1) + org_str.substring(caret_position, org_str.length);
  elem.setSelectionRange(caret_position - 1, caret_position - 1);
}

function deleteBackwardWord(){
  var elem = document.activeElement;
  var caret_position = elem.selectionEnd;
  var org_str = elem.value;
  elem.value = org_str.substring(0, caret_position - 1).replace(/\S*\s*$/,'') + org_str.substring(caret_position, org_str.length);
  var position = elem.value.length - (org_str.length - caret_position);
  elem.setSelectionRange(position,position);
}

function addKeyBind( key, func, eve ){
  var pressedKey = get_key(eve);
  if( pressedKey == key ){
    eve.preventDefault();  //Stop Default Event
    eval(func);
  }
  return false;
}

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

function initKeyBind(e){
  var t = e.target;
  if( t.nodeType == 1){
    tn=t.tagName.toLowerCase();
    if( tn == 'input' || tn == 'textarea' ){
      addKeyBind( 'Esc', 'blurFocus()', e );
      addKeyBind( 'C-[', 'blurFocus()', e ); // = Esc
      addKeyBind( 'C-a', 'moveFirstOrSelectAll()', e );
      addKeyBind( 'C-e', 'moveEnd()', e );
      addKeyBind( 'C-f', 'moveForward()', e );
      addKeyBind( 'C-b', 'moveBackward()', e );
      addKeyBind( 'C-d', 'deleteForward()', e );
      addKeyBind( 'C-h', 'deleteBackward()', e );
      addKeyBind( 'C-w', 'deleteBackwardWord()', e );
      return;
    }
    addKeyBind( 'j', 'smoothScrollDown()', e );
    addKeyBind( 'k', 'smoothScrollUp()', e );
    addKeyBind( 'h', 'smoothScrollLeft()', e );
    addKeyBind( 'l', 'smoothScrollRight()', e );
    addKeyBind( 'r', 'reload()', e );
    addKeyBind( 'R', 'reloadAll()', e );
    addKeyBind( 'd', 'closeTab()', e );
    addKeyBind( 'u', 'reopenTab()', e );
    addKeyBind( 'C-p', 'previousTab()', e );
    addKeyBind( 'C-n', 'nextTab()', e );
    addKeyBind( 'H', 'historyBack()', e );
    addKeyBind( 'L', 'historyForward()', e );
    addKeyBind( 'G', 'scrollToBottom()', e );
    addKeyBind( '0', 'scrollToLeft()', e );
    addKeyBind( '$', 'scrollToRight()', e );
    addKeyBind( 'Esc', 'blurFocus()', e );
    addKeyBind( 'C-[', 'blurFocus()', e ); // = Esc
    addKeyBind( 'C-z', 'passMode()', e );
    addKeyBind( 'g', 'gMode()', e );
    addKeyBind( ']', 'pageMode("]")', e );
    addKeyBind( '[', 'pageMode("[")', e );
    addKeyBind( 'z', 'zMode()', e );
    addKeyBind( 'f', 'hintMode()', e );
    addKeyBind( 'F', 'hintMode(true)', e );
  }
  return false;
}

var keyId = {
  "U+0008" : "BackSpace",
  "U+0009" : "Tab",
  "U+0018" : "Cancel",
  "U+001B" : "Esc",
  "U+0020" : "Space",
  "U+0021" : "!",
  "U+0022" : "\"",
  "U+0023" : "#",
  "U+0024" : "$",
  "U+0026" : "&",
  "U+0027" : "'",
  "U+0028" : "(",
  "U+0029" : ")",
  "U+002A" : "*",
  "U+002B" : "+",
  "U+002C" : ",",
  "U+002D" : "-",
  "U+002E" : ".",
  "U+002F" : "/",
  "U+0030" : "0",
  "U+0031" : "1",
  "U+0032" : "2",
  "U+0033" : "3",
  "U+0034" : "4",
  "U+0035" : "5",
  "U+0036" : "6",
  "U+0037" : "7",
  "U+0038" : "8",
  "U+0039" : "9",
  "U+003A" : ":",
  "U+003B" : ";",
  "U+003C" : "<",
  "U+003D" : "=",
  "U+003E" : ">",
  "U+003F" : "?",
  "U+0040" : "@",
  "U+0041" : "a",
  "U+0042" : "b",
  "U+0043" : "c",
  "U+0044" : "d",
  "U+0045" : "e",
  "U+0046" : "f",
  "U+0047" : "g",
  "U+0048" : "h",
  "U+0049" : "i",
  "U+004A" : "j",
  "U+004B" : "k",
  "U+004C" : "l",
  "U+004D" : "m",
  "U+004E" : "n",
  "U+004F" : "o",
  "U+0050" : "p",
  "U+0051" : "q",
  "U+0052" : "r",
  "U+0053" : "s",
  "U+0054" : "t",
  "U+0055" : "u",
  "U+0056" : "v",
  "U+0057" : "w",
  "U+0058" : "x",
  "U+0059" : "y",
  "U+005A" : "z",
  //"U+005B" : "[",
  //"U+005C" : "\\",
  //"U+005D" : "]",
  "U+00DB" : "[",
  "U+00DC" : "\\",
  "U+00DD" : "]",
  "U+005E" : "^",
  "U+005F" : "_",
  "U+0060" : "`",
  "U+007B" : "{",
  "U+007C" : "|",
  "U+007D" : "}",
  "U+007F" : "Delete",
  "U+00A1" : "¡",
  "U+0300" : "CombAcute",
  "U+0302" : "CombCircum",
  "U+0303" : "CombTilde",
  "U+0304" : "CombMacron",
  "U+0306" : "CombBreve",
  "U+0307" : "CombDot",
  "U+0308" : "CombDiaer",
  "U+030A" : "CombRing",
  "U+030B" : "CombDblAcute",
  "U+030C" : "CombCaron",
  "U+0327" : "CombCedilla",
  "U+0328" : "CombOgonek",
  "U+0345" : "CombYpogeg",
  "U+20AC" : "€",
  "U+3099" : "CombVoice",
  "U+309A" : "CombSVoice"
};

function get_key(evt){
  var key = keyId[evt.keyIdentifier] || evt.keyIdentifier,
  ctrl = evt.ctrlKey ? 'C-' : '',
  meta = (evt.metaKey || evt.altKey) ? 'M-' : '',
  shift = evt.shiftKey ? 'S-' : '';
//    if (/^(Meta|Shift|Control|Alt)$/.test(key)) return key; // safari only
  if (evt.shiftKey){
    if (/^[a-z]$/.test(key)){
      return ctrl+meta+key.toUpperCase();
    }
    if (/^[0-9]$/.test(key)) {
      switch(key) {
      case "4":
        key = "$";
        break;
      }
      return key;
    }
    if (/^(Enter|Space|BackSpace|Tab|Esc|Home|End|Left|Right|Up|Down|PageUp|PageDown|F(\d\d?))$/.test(key)){
      return ctrl+meta+shift+key;
    }
  }
  return ctrl+meta+key;
}
