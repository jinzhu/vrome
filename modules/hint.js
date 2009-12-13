/**
 * Hint
 */

var Hint = (function(){
	var hint_str             = '';
	var hint_str_num         = 0;
	var hint_elems           = [];
	var hint_elems_filter    = [];
	var hint_open_in_new_tab = false;
	var currentSelectHint    = false;

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

})()
