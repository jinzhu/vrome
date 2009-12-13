// vim:ft=javascript
//
// TODO
//var exclude_urls = [/\/\/www\.google\.[^\/]+\/reader\//,  /\/\/mail\.google\.com\/mail\//, /\/\/www\.pivotaltracker\.com\//];
//for (var i = 0; i < exclude_urls.length; i++) {
//  if ( exclude_urls[i].test(location.href) ) {
//    return;
//  }
//}
function extend(to,from) {
  if (!to) to = {};
  for(var p in from) to[p] = from[p];
  return to;
}

var interval          = 20;
var vertical_moment   = 250;
var horizontal_moment = 100;
var nextSmoothScroll;

var hint_str             = '';
var hint_str_num         = 0;
var hint_elems           = [];
var hint_elems_filter    = [];
var hint_open_in_new_tab = false;
var currentSelectHint    = false;

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
// Scroll
//////////////////////////////////////////////////
function smoothScrollDown(){
  smoothScrollBy(0,vertical_moment);
}

function smoothScrollUp(){
  smoothScrollBy(0,-vertical_moment);
}

function smoothScrollRight(){
  smoothScrollBy(horizontal_moment,0);
}

function smoothScrollLeft(){
  smoothScrollBy(-horizontal_moment,0);
}

function smoothScrollBy(x,y){
  clearTimeout(nextSmoothScroll);
  smoothScroll(x,y);
}

function smoothScroll(x,y){
  x = Number(x), y = Number(y);

  scrollBy(x,y);

  if (Math.max(Math.abs(x),Math.abs(y)) >= 1) {
    nextSmoothScroll = setTimeout(function(){ scrollBy(x,y); }, interval);
  }
}

function scrollToTop(){
  scrollTo(scrollX, 0);
  keyListener({add : initKeyBind,remove : gHandler});
}

function scrollToBottom(){
  scrollTo(scrollX, document.height);
}

function scrollToLeft(){
  scrollTo(0, scrollY);
}

function scrollToRight(){
  scrollTo(document.width, scrollY);
}

//////////////////////////////////////////////////
// Reload
//////////////////////////////////////////////////
function reload(){
  location.reload();
}

function reloadAll(){
  var port = chrome.extension.connect();
  port.postMessage({action: "reload_all_tabs"});
}

//////////////////////////////////////////////////
// Tab
//////////////////////////////////////////////////
function closeTab(){
  var port = chrome.extension.connect();
  port.postMessage({action: "close_tab"});
}

function reopenTab(){
  var port = chrome.extension.connect();
  port.postMessage({action: "reopen_tab"});
}

function previousTab(){
  var port = chrome.extension.connect();
  port.postMessage({action: "previous_tab"});
}

function nextTab(){
  var port = chrome.extension.connect();
  port.postMessage({action: "next_tab"});
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

//////////////////////////////////////////////////
// PageMode
//////////////////////////////////////////////////
function pageMode(key){
  keyListener({add : key == ']' ? nextPageHandler : prevPageHandler,remove : initKeyBind});
}

function nextPageHandler(e){
  addKeyBind( ']', 'nextPage()', e );
  var pressedKey = get_key(e);
  if (pressedKey != ']'){
    keyListener({add : initKeyBind,remove : nextPageHandler});
  }
}

function prevPageHandler(e){
  addKeyBind( '[', 'prevPage()', e );
  var pressedKey = get_key(e);
  if (pressedKey != '['){
    keyListener({add : initKeyBind,remove : prevPageHandler});
  }
}

function nextPage(){
  selectPagesByMatch(['(下|后)一页','\b?Next\b?','^>$','^More$','(^(>>|››|»))|((»|››|>>)$)'])
}

function prevPage(){
  selectPagesByMatch(['(上|前)一页','\b?(Prev|Previous)\b?','^<$','(^(<<|‹‹|«))|((<<|‹‹|«)$)'])
}

function selectPagesByMatch(regexps){
  elems = document.getElementsByTagName('a');
  for(var i in regexps){
    for(var cur in elems){
      if(new RegExp(regexps[i],'i').test(elems[cur].innerText)){
        return execSelect(elems[cur]);
      }
    }
  }
}

////////////////////////////////////////
// Hint Mode
////////////////////////////////////////
function hintMode(newtab){
  hint_str     = '';
  hint_elems   = [];
  hint_str_num = 0;
  hint_open_in_new_tab = newtab ? true : false;
  setHints();
  notice({title : 'Follow Hint:'});
  keyListener({add : hintHandler,remove : initKeyBind});
}

function hintHandler(e){
  e.preventDefault();  //Stop Default Event
  var pressedKey = get_key(e);

  if (pressedKey =='Esc') {
     removeHints();
  } else {
    if(pressedKey == 'Enter'){
      highlightAndJumpCurrentHint('',true);
    }else{
      highlightAndJumpCurrentHint(pressedKey,false);
    }
  }
}

function highlightAndJumpCurrentHint(str,force_jump){
  if(/^\d$/.test(str)){
    hint_str_num = hint_str_num * 10 + Number(str);

    var cur = hint_str_num - 1;
    setHighlight(hint_elems_filter[cur],true);
    currentSelectHint = hint_elems_filter[cur];

    notice({ content : notice().content.replace(/(\s\(\d+\))?$/,' (' + hint_str_num + ')') });

    if (force_jump || ((cur + 1)* 10 > hint_elems_filter.length)){
      return execSelect( hint_elems_filter[cur] );
    }
  }else{
    if(str == 'BackSpace'){
      hint_str = hint_str.slice(0,-1);
    }else if(/^\w$/.test(str)){
      hint_str = hint_str + str;
    }

    notice({ content : hint_str });

    hint_str_num      = 0
    hint_elems_filter = [];

    // filte string key
    for(var i in hint_elems){
      if(new RegExp(hint_str,'im').test(CC2PY(hint_elems[i].innerText))){
        hint_elems_filter[hint_elems_filter.length] = hint_elems[i];
      }
    }
    setDefaultHintOrder(hint_elems_filter);

    if (force_jump || hint_elems_filter.length == 1) {
      return execSelect(currentSelectHint ? currentSelectHint : hint_elems_filter[0]);
    }
    currentSelectHint = false;
  }
}

function setHighlight(elem, is_active) {
  if(elem == undefined) { return false; }

  if (is_active) {
    var active_elem = document.body.querySelector('a[highlight=hint_active]');
    if (active_elem != undefined){
      active_elem.setAttribute('highlight', 'hint_elem');
    }
    elem.setAttribute('highlight', 'hint_active');
  } else {
    elem.setAttribute('highlight', 'hint_elem');
  }
}

function setHintRules() {
  var ss = document.styleSheets[0];
  ss.insertRule('a[highlight=hint_elem] {background-color: yellow}', 0);
  ss.insertRule('a[highlight=hint_active] {background-color: lime}', 0);
}

function deleteHintRules() {
  var ss = document.styleSheets[0];
  ss.deleteRule(0);
  ss.deleteRule(0);
}

function clickLink(link) {
  var event = document.createEvent("MouseEvents");
  //event.initMouseEvent(type, canBubble, cancelable, view,
  //                     detail, screenX, screenY, clientX, clientY,
  //                     ctrlKey, altKey, shiftKey, metaKey,
  //                     button, relatedTarget);
  // https://developer.mozilla.org/en/DOM/event.initMouseEvent
  event.initMouseEvent("click", true, true, window,
      0, 0, 0, 0, 0,
      false, false, false, false,
      0, null);
  link.dispatchEvent(event);
}

function execSelect(elem) {
  // if the element is not a really element,then return and remove all hints
  if(elem == undefined){ return removeHints(); }

  var tag_name = elem.tagName.toLowerCase();
  var type = elem.type ? elem.type.toLowerCase() : "";

  if (tag_name == 'a' && elem.href != '') {
    setHighlight(elem, true);

    var original_target = elem.getAttribute('target');

    if(hint_open_in_new_tab){ elem.setAttribute('target','_blank'); }

    clickLink(elem);

    elem.setAttribute('target',original_target);
  } else if (tag_name == 'input' && (type == "submit" || type == "button" || type == "reset")) {
    elem.click();
  } else if (tag_name == 'input' && (type == "radio" || type == "checkbox")) {
    // TODO: toggle checkbox
    elem.checked = !elem.checked;
  } else if (tag_name == 'input' || tag_name == 'textarea') {
    elem.focus();
    elem.setSelectionRange(elem.value.length, elem.value.length);
  } else if (tag_name == 'select'){
    elem.focus();
  }

  removeHints();
}

function setHints() {
  setHintRules();
  // TODO: <area>
  var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button');

  for (var i = 0; i < elems.length; i++) {
    if (isHintDisplay(elems[i])){
      hint_elems.push(elems[i]);
    }
  }
  setDefaultHintOrder(hint_elems);
  hint_elems_filter = hint_elems;
}

// the element is seeable
function isHintDisplay(elem) {
  var win_top = window.scrollY / currentZoom();
  var win_bottom = win_top + window.innerHeight;
  var win_left = window.scrollX / currentZoom();
  var win_right = win_left + window.innerWidth;

  var pos = elem.getBoundingClientRect();
  var elem_top = win_top + pos.top;
  var elem_bottom = win_top + pos.bottom;
  var elem_left = win_left + pos.left;
  var elem_right = win_left + pos.left;

  return pos.height != 0 && pos.width != 0 && elem_bottom >= win_top && elem_top <= win_bottom && elem_left <= win_right && elem_right >= win_left;
}

// set hint's order and background
function setDefaultHintOrder(elems){
  // delete old highlight hints
  for (var i = 0; i < hint_elems.length; i++) {
    hint_elems[i].removeAttribute('highlight');
  }

  var div = document.body.querySelector('div[highlight=hints]');
  if (div != undefined) {
    document.body.removeChild(div);
  }

  // create new highlight hints
  var div = document.createElement('div');
  div.setAttribute('highlight', 'hints');
  document.body.appendChild(div);

  for(var i in elems){
    elem = elems[i];
    var win_top = window.scrollY / currentZoom();
    var win_left = window.scrollX / currentZoom();

    var pos = elem.getBoundingClientRect();
    var elem_top = win_top + pos.top;
    var elem_left = win_left + pos.left;

    var span = document.createElement('span');
    span.style.cssText = [
      'left: ', elem_left, 'px;',
      'top: ', elem_top, 'px;',
      'position: absolute;',
      'font-size: 13px;',
      'background-color: ' + (hint_open_in_new_tab ? '#ff6600' : 'red') + ';',
      'color: white;',
      'font-weight: bold;',
      'padding: 0px 1px;',
      'z-index: 100000;'
        ].join('');

    span.innerHTML = Number(i) + 1; // cur
    div.appendChild(span);

    setHighlight(elem, false);
    if (i == 0 && elems[i].tagName.toLowerCase() == 'a') {
      setHighlight(elem, true);
    }
  }
}

function removeHints() {
  removeNotice();

  deleteHintRules();
  for (var i = 0; i < hint_elems.length; i++) {
    hint_elems[i].removeAttribute('highlight');
  }

  var div = document.body.querySelector('div[highlight=hints]');
  if (div != undefined) {
    document.body.removeChild(div);
  }

  keyListener({remove : hintHandler,add : initKeyBind});
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
