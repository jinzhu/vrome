/**
 * Hint
 */

var Hint = (function(){
  var elements    = [];
  var numbers     = 0;
  var currentHint = false;
	var new_tab     = false;
  var matched     = [];
	var hintMode   = false;

  function start(newTab){
		hintMode    = true;
    elements    = [];
    numbers     = 0;
    currentHint = false;
    new_tab = newTab;
    setHints();
    CmdLine.set({title : 'HintMode',pressDown : handleInput,content : ''});
    document.getElementById('__vimlike_cmd_input_box').focus();
  }

  function setHints() {
    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button,*[onclick]');
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
    if(div) document.body.removeChild(div);
    div = document.createElement('div');
    div.setAttribute('id', '__vim_hint_highlight');
    document.body.appendChild(div);

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
      span.innerHTML             = Number(i) + 1; // cur
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
		CmdLine.remove();
		hintMode = false;

    deleteHintRules();

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
      setHighlight(matched[cur],true);
      //TODO set notice
      currentHint = matched[cur];
      e.preventDefault();
			CmdLine.set({title : 'HintMode (' + numbers + ')'});

      if (numbers * 10 > matched.length){
        return execSelect( currentHint );
      }
    }else{
      if(key != 'Esc') setTimeout(delayToWaitKeyDown,50);
    }
  }

  function delayToWaitKeyDown(){
    numbers = 0
    matched = [];

    for(var i in elements){
      if ( new RegExp(CmdLine.get().content,'im').test(elements[i].innerText) ){
        matched.push(elements[i]);
      }
    }

    setOrder(matched);

    if (key == 'Enter' || matched.length == 1) {
      return execSelect(currentHint ? currentHint : matched[0]);
    }
    currentHint = false;
  }

  function execSelect(elem) {
    if(!elem){ return false; }
    var tag_name = elem.tagName.toLowerCase();
    var type     = elem.type ? elem.type.toLowerCase() : "";

    if (tag_name == 'a') {
      setHighlight(elem, true);
      clickElement(elem,{ ctrl : new_tab });

    } else if (tag_name == "input" && (type == "submit" || type == "button" || type == "reset" || type == "radio" || type == "checkbox")) {
      clickElement(elem);

    } else if (tag_name == 'input' || tag_name == 'textarea') {
      try{
        elem.focus();
        elem.setSelectionRange(elem.value.length, elem.value.length);
      }catch(e){
        clickElement(elem); // some website don't use standard submit input.
      }

    } else if (tag_name == 'select'){
      elem.focus();

    } else if (elem.onclick) {
      clickElement(elem);
    }

    remove();
  }

  return {
    start         : start,
    new_tab_start : function(){ start(true) },
    remove        : function(){
                      if(hintMode) remove();
                    }
  }
})()
