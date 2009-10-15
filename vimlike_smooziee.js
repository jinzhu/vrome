(function(){
  var interval = 20;
  var vertical_moment = 250;
  var horizontal_moment = 100;
  var next;
  var flg;
  
  var zoom_settings = [];
  var zoom_levels = ['30%', '50%', '67%', '80%', '90%', '100%', '110%', '120%', '133%', '150%', '170%', '200%', '240%', '300%']
  var defalut_zoom_index = zoom_levels.indexOf('100%');

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

  function addKeyBind( key, func, eve ){
    var pressedKey = get_key(eve);
    if( pressedKey == key ){
      eve.preventDefault();  //Stop Default Event 
      eval(func);
    }
  }

  document.addEventListener( 'keydown', initKeyBind, false );

  function initKeyBind(e){
    var t = e.target;
    if( t.nodeType == 1){
      tn=t.tagName.toLowerCase();
      if( tn == 'input' || tn == 'textarea' ){
        addKeyBind( 'Esc', 'blurFocus()', e );
        addKeyBind( 'C-a', 'moveFirstOrSelectAll()', e );
        addKeyBind( 'C-e', 'moveEnd()', e );
        addKeyBind( 'C-f', 'moveForward()', e );
        addKeyBind( 'C-b', 'moveBackward()', e );
        addKeyBind( 'C-d', 'deleteForward()', e );
        addKeyBind( 'C-h', 'deleteBackward()', e );
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
      addKeyBind( 'g', 'gMode()', e );
      addKeyBind( 'z', 'zMode()', e );
    }
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
    "U+005B" : "[",
    "U+005C" : "\\",
    "U+005D" : "]",
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
