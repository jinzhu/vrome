/**
 * Hint
 */

var Hint = (function(){
  var elements    = [];
  var matched     = [];
  var numbers     = 0;
  var currentHint = false;
	//var hint_open_in_new_tab = false;

  function start(){
    CmdLine.set({title : 'HintMode',inputFunction : handleInput});
    elements    = [];
    matched     = [];
    numbers     = 0;
    currentHint = false;
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

  function deleteHintRules() {
    var ss = document.styleSheets[0];
    ss.deleteRule(0);
    ss.deleteRule(0);
  }

  function remove(){
    deleteHintRules();
    CmdLine.remove();

    for (var i = 0; i < elements.length; i++) {
      elements[i].removeAttribute('highlight');
    }

    var div = document.getElementById('__vim_hint_highlight');
    if (div) { document.body.removeChild(div); }
  }

  function handleInput(e){
    key = KeyEvent.getKey(e);

    if(/^\d$/.test(key)){
      numbers = numbers * 10 + Number(key);
      var cur = numbers - 1;
      setHighlight(elements[cur],true);
      //TODO set notice
      currentHint = elements[cur];
      e.preventDefault();

      if (numbers * 10 > elements.length){
        return execSelect( currentHint );
      }
  }else{
    numbers = 0

    matched = [];
    // filte string key
    for(var i in elements){
      if ( new RegExp(CmdLine.get().content,'im').test(elements[i].innerText) ){
        matched[matched.length] = elements[i];
      }
    }

    setOrder(matched);

    if (key == 'Enter' || matched.length == 1) {
      return execSelect(currentHint ? currentHint : matched[0]);
    }
    currentHint = false;
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
    remove : remove,
  }
})()
