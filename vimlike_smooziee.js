(function(){
  // TODO
  var exclude_urls = [/\/\/www\.google\.[^\/]+\/reader\//,  /\/\/mail\.google\.com\/mail\//]
  for (var i = 0; i < exclude_urls.length; i++) {
    if ( exclude_urls[i].test(location.href) ) {
      return;
    }
  }

  var interval = 20;
  var vertical_moment = 250;
  var horizontal_moment = 100;
  var next;
  var flg;

  var hint_num_str = '';
  var hint_elems = [];
  var hint_open_in_new_tab = false;
  
  var zoom_settings = [];
  var zoom_levels = ['30%', '50%', '67%', '80%', '90%', '100%', '110%', '120%', '133%', '150%', '170%', '200%', '240%', '300%']
  var defalut_zoom_index = zoom_levels.indexOf('100%');

  chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
      var tab = port.tab;
      switch(msg.action){
      case "remove_hints":
        removeHints();
        break;
      };
    });
  });

  function smoothScrollDown(){
    flg = 'vertical';
    smoothScrollBy(vertical_moment);
  }
  
  function smoothScrollUp(){
    flg = 'vertical';
    smoothScrollBy(-vertical_moment);
  }
  
  function smoothScrollRight(){
    flg = 'horizontal';
    smoothScrollBy(horizontal_moment);
  }
  
  function smoothScrollLeft(){
    flg = 'horizontal';
    smoothScrollBy(-horizontal_moment);
  }
  
  function smoothScrollBy(moment){
    clearTimeout(next);
    smoothScroll(moment);
  }
  
  function smoothScroll(moment){
    if (moment > 0)
      moment = Math.floor(moment / 2);
    else
      moment = Math.ceil(moment / 2);
  
    scrollFunc(moment);
  
    if (Math.abs(moment) < 1) {
      setTimeout(function() {scrollFunc(moment)});
      return;
    }
  
    next = setTimeout(function() {smoothScroll(moment)}, interval);
  }
  
  function scrollFunc(moment) {
    if (flg == 'vertical') {
      scrollBy(0, moment);
    } else if (flg == 'horizontal') {
      scrollBy(moment, 0);
    }
  }

  function scrollToTop(){
    scroll(0, -document.documentElement.scrollHeight)
  }

  function scrollToBottom(){
    scroll(0, document.documentElement.scrollHeight)
  }

  function scrollToFirst(){
    var scrollTop  = document.body.scrollTop  || document.documentElement.scrollTop;
    scroll(-document.documentElement.scrollWidth, scrollTop)
  }

  function scrollToLast(){
    var scrollTop  = document.body.scrollTop  || document.documentElement.scrollTop;
    scroll(document.documentElement.scrollWidth, scrollTop)
  }

  function reload(){
    location.reload();
  }
 
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
 
  function historyBack(){
    history.back();
  }
 
  function historyForward(){
    history.forward();
  }

  function zoomDefault() {
    var domain = document.domain;
    setZoom(defalut_zoom_index, domain);
  }

  function zoomIn() {
    var domain = document.domain;
    setZoomCountup(1, domain);
  }

  function zoomOut() {
    var domain = document.domain;
    setZoomCountup(-1, domain);
  }

  function zoomMore() {
    var domain = document.domain;
    setZoomCountup(3, domain);
  }

  function zoomReduce() {
    var domain = document.domain;
    setZoomCountup(-3, domain);
  }

  function setZoomCountup(countup, domain) {
    var now_zoom_level = zoom_settings[domain];
    if (now_zoom_level == undefined) {
      now_zoom_level = defalut_zoom_index;
    }
    var zoom_level;
    zoom_level = now_zoom_level + countup;
    if ( zoom_level <= 0 ) {
      zoom_level = 0;
    } else if (zoom_level >= zoom_levels.length) {
      zoom_level = zoom_levels.length - 1;
    }
    setZoom(zoom_level, domain);
  }

  function setZoom(zoom_level, domain) {
    document.body.style.zoom = zoom_levels[zoom_level];
    if (zoom_level == defalut_zoom_index) {
      delete zoom_settings[domain];
    } else {
      zoom_settings[domain] = zoom_level;
    }
    document.removeEventListener('keydown', zHandler, false);
    document.addEventListener('keydown', initKeyBind, false);
  }

  function currentZoom() {
    var domain = document.domain;
    var zoom_level = zoom_settings[domain];
    if (zoom_level == undefined)
      return 1;
    return ( parseInt(zoom_levels[zoom_level]) / 100 );
  }

  function gMode(){
    document.addEventListener('keydown', gHandler, false);
  }

  function gHandler(e){
    addKeyBind( 'g', 'scrollToTop()', e );
    addKeyBind( 'i', 'focusFirstTextInput()', e );
    var pressedKey = get_key(e);
    if (pressedKey != 'g' && pressedKey != 'i')
      document.removeEventListener('keydown', gHandler, false);
  }

  function zMode(){
    document.removeEventListener('keydown', initKeyBind, false);
    document.addEventListener('keydown', zHandler, false);
  }

  function zHandler(e){
    addKeyBind( 'z', 'zoomDefault()', e );
    addKeyBind( 'i', 'zoomIn()', e );
    addKeyBind( 'o', 'zoomOut()', e );
    addKeyBind( 'm', 'zoomMore()', e );
    addKeyBind( 'r', 'zoomReduce()', e );
    var pressedKey = get_key(e);
    if (/[ziomr]/.test(pressedKey) == false) {
      document.removeEventListener('keydown', zHandler, false);
      document.addEventListener('keydown', initKeyBind, false);
    }
  }

  function hintMode(newtab){
    if (newtab) {
      hint_open_in_new_tab = true;
    } else {
      hint_open_in_new_tab = false;
    }
    setHints();
    document.removeEventListener('keydown', initKeyBind, false);
    document.addEventListener('keydown', hintHandler, false);
    hint_num_str = '';
  }

  function hintHandler(e){
    e.preventDefault();  //Stop Default Event 
    var pressedKey = get_key(e);
    if (pressedKey == 'Enter') {
      if (hint_num_str == '')
        hint_num_str = '1';
      judgeHintNum(Number(hint_num_str));
    } else if (/[0-9asdfghjkl;]/.test(pressedKey) == false || pressedKey =='Esc') {
       removeHints();
    } else {
      // TODO
      if (pressedKey == 'U+00BA') {
        pressedKey = ';';
      }
      var num = ';asdfghjkl'.indexOf(pressedKey);
      if (num >= 0) {
        pressedKey = num;
      }
      hint_num_str += pressedKey;
      var hint_num = Number(hint_num_str);
      if (hint_num * 10 > hint_elems.length + 1) {
        judgeHintNum(hint_num);
      } else {
        var hint_elem = hint_elems[hint_num - 1];
        if (hint_elem != undefined && hint_elem.tagName.toLowerCase() == 'a') {
          setHighlight(hint_elem, true);
        }
      }
    }
  }

  function setHighlight(elem, is_active) {
    if (is_active) {
      var active_elem = document.body.querySelector('a[highlight=hint_active]');
      if (active_elem != undefined)
        active_elem.setAttribute('highlight', 'hint_elem');
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

  function judgeHintNum(hint_num) {
    var hint_elem = hint_elems[hint_num - 1];
    if (hint_elem != undefined) {
      execSelect(hint_elem);
    } else {
      removeHints();
    }
  }

  function execSelect(elem) {
    var tag_name = elem.tagName.toLowerCase();
    var type = elem.type ? elem.type.toLowerCase() : "";
    if (tag_name == 'a' && elem.href != '') {
      setHighlight(elem, true);
      var port = chrome.extension.connect();
      // TODO: ajax, <select>
      port.postMessage({action: "open_url", url: elem.href, newtab: hint_open_in_new_tab});
    } else if (tag_name == 'input' && (type == "submit" || type == "button" || type == "reset")) {
      elem.click();
    } else if (tag_name == 'input' && (type == "radio" || type == "checkbox")) {
      // TODO: toggle checkbox
      elem.checked = !elem.checked;
      removeHints();
    } else if (tag_name == 'input' || tag_name == 'textarea') {
      elem.focus();
      elem.setSelectionRange(elem.value.length, elem.value.length);
      removeHints();
    }
  }

  function setHints() {
    setHintRules();
    var win_top = window.scrollY / currentZoom();
    var win_bottom = win_top + window.innerHeight;
    var win_left = window.scrollX / currentZoom();
    var win_right = win_left + window.innerWidth;
    // TODO: <area>
    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button');
    var div = document.createElement('div');
    div.setAttribute('highlight', 'hints');
    document.body.appendChild(div);
    for (var i = 0; i < elems.length; i++) {
      var elem = elems[i];
      if (!isHintDisplay(elem))
        continue;
      var pos = elem.getBoundingClientRect();
      var elem_top = win_top + pos.top;
      var elem_bottom = win_top + pos.bottom;
      var elem_left = win_left + pos.left;
      var elem_right = win_left + pos.left;
      if ( elem_bottom >= win_top && elem_top <= win_bottom) {
        hint_elems.push(elem);
        setHighlight(elem, false);
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
        span.innerHTML = hint_elems.length;
        div.appendChild(span);
        if (elem.tagName.toLowerCase() == 'a') {
          if (hint_elems.length == 1) {
            setHighlight(elem, true);
          } else {
            setHighlight(elem, false);
          }
        }
      }
    }
  }

  function isHintDisplay(elem) {
    var pos = elem.getBoundingClientRect();
    return (pos.height != 0 && pos.width != 0);
  }

  function removeHints() {
    deleteHintRules();
    for (var i = 0; i < hint_elems.length; i++) {
      hint_elems[i].removeAttribute('highlight');
    }
    hint_elems = [];
    hint_num_str = '';
    var div = document.body.querySelector('div[highlight=hints]');
    if (div != undefined) {
      document.body.removeChild(div);
    }
    document.removeEventListener('keydown', hintHandler, false);
    document.addEventListener('keydown', initKeyBind, false);
  }

  function focusFirstTextInput(){
    var elem = document.querySelector('input[type="text"],input:not([type])');
    if (elem) {
      elem.focus();
      elem.setSelectionRange(elem.value.length, elem.value.length);
    }
  }

  function blurFocus(){
    document.activeElement.blur();
  }

  function moveFirstOrSelectAll(){
    var elem = document.activeElement;
    var caret_position = elem.selectionEnd;
    if (caret_position == 0)
      elem.setSelectionRange(0, elem.value.length); // select all text
    else
      elem.setSelectionRange(0, 0);
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
    var org_str = elem.value
    elem.value = org_str.substring(0, caret_position) + org_str.substring(caret_position + 1, org_str.length);
    elem.setSelectionRange(caret_position, caret_position);
  }

  function deleteBackward(){
    var elem = document.activeElement;
    var caret_position = elem.selectionEnd;
    var org_str = elem.value
    elem.value = org_str.substring(0, caret_position - 1) + org_str.substring(caret_position, org_str.length);
    elem.setSelectionRange(caret_position - 1, caret_position - 1);
  }

  function deleteBackwardWord(){
    var elem = document.activeElement;
    var caret_position = elem.selectionEnd;
    var org_str = elem.value
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

  document.addEventListener( 'keydown', initKeyBind, false );

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
      addKeyBind( 'd', 'closeTab()', e );
      addKeyBind( 'u', 'reopenTab()', e );
      //addKeyBind( 'C-p', 'previousTab()', e );
      //addKeyBind( 'C-n', 'nextTab()', e );
      addKeyBind( 'H', 'historyBack()', e );
      addKeyBind( 'L', 'historyForward()', e );
      addKeyBind( 'G', 'scrollToBottom()', e );
      addKeyBind( '0', 'scrollToFirst()', e );
      addKeyBind( '$', 'scrollToLast()', e );
      addKeyBind( 'Esc', 'blurFocus()', e );
      addKeyBind( 'C-[', 'blurFocus()', e ); // = Esc
      addKeyBind( 'g', 'gMode()', e );
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
    "U+0300" : "CombGrave",
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
    "U+309A" : "CombSVoice",
  }

  function get_key(evt){
    var key = keyId[evt.keyIdentifier] || evt.keyIdentifier,
    ctrl = evt.ctrlKey ? 'C-' : '',
    meta = (evt.metaKey || evt.altKey) ? 'M-' : '',
    shift = evt.shiftKey ? 'S-' : '';
//    if (/^(Meta|Shift|Control|Alt)$/.test(key)) return key; // safari only
    if (evt.shiftKey){
      if (/^[a-z]$/.test(key)) 
        return ctrl+meta+key.toUpperCase();
      if (/^[0-9]$/.test(key)) {
        switch(key) {
        // TODO
        case "4":
          key = "$";
          break;
        };
        return key;
      }
      if (/^(Enter|Space|BackSpace|Tab|Esc|Home|End|Left|Right|Up|Down|PageUp|PageDown|F(\d\d?))$/.test(key)) 
        return ctrl+meta+shift+key;
    }
    return ctrl+meta+key;
  }

})();
