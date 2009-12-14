/**
 * Hint
 */

var Hint = (function(){
  var elements = [];
  var matched  = [];
  var numbers  = 0;
	//var hint_open_in_new_tab = false;

  function start(){
    CmdLine.set({title : 'HintMode'});
    elements = [];
    matched  = [];
    numbers  = 0;
    setHints();
  }

  function setHints() {
    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button');
    for (var i = 0; i < elems.length; i++) {
      if (isHintDisplay(elems[i])){
        elements.push(elems[i]);
      }
    }
    setOrder(elements);
    matched = elements;
  }

  function isHintDisplay(elem) {
    var win_top     = window.scrollY / Zoom.current();
    var win_bottom  = win_top + window.innerHeight;
    var win_left    = window.scrollX / Zoom.current();
    var win_right   = win_left + window.innerWidth;

    var pos         = elem.getBoundingClientRect();
    var elem_top    = win_top + pos.top;
    var elem_bottom = win_top + pos.bottom;
    var elem_left   = win_left + pos.left;
    var elem_right  = win_left + pos.left;

    return pos.height != 0 && pos.width != 0 && elem_bottom >= win_top && elem_top <= win_bottom && elem_left <= win_right && elem_right >= win_left;
  }

  function setHintRules() {
    var ss = document.styleSheets[0];
    ss.insertRule('a[highlight=hint_elem] {background-color: yellow}', 0);
    ss.insertRule('a[highlight=hint_active] {background-color: lime}', 0);
  }

  function setOrder(elems){
    setHintRules();
    // delete old highlight hints
    for (var i = 0; i < elements.length; i++) {
      elements[i].removeAttribute('highlight');
    }

    var div = document.getElementById('__vim_hint_highlight');
    if (!div) {
      div = document.createElement('div');
      div.setAttribute('id', '__vim_hint_highlight');
      document.body.appendChild(div);
    }

    for(var i in elems){ //TODO need refactor
      elem          = elems[i];
      var win_top   = window.scrollY / Zoom.current();
      var win_left  = window.scrollX / Zoom.current();
      var pos       = elem.getBoundingClientRect();
      var elem_top  = win_top + pos.top;
      var elem_left = win_left + pos.left;

      var span = document.createElement('span');
      span.setAttribute('id', '__vim_hint_highlight_span');
      span.style.left            = elem_left + 'px';
      span.style.top             = elem_top  + 'px';
      span.style.backgroundColor = 'red';
      span.innerHTML = Number(i) + 1; // cur
      div.appendChild(span);

      setHighlight(elem, false);
      if (i == 0 && elems[i].tagName.toLowerCase() == 'a') {
        setHighlight(elem, true);
      }
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

  return {
    start : start,
  }
})()
