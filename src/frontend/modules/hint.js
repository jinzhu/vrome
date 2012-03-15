var Hint = (function() {
  var currentHint, new_tab, multi_mode, hintMode, selected, elements, matched, key;
  var highlight = 'vrome_highlight';

  function start(newTab, multiMode) {
		hintMode    = true;
    multi_mode  = multiMode;
		selected    = 0; // set current selected number
		currentHint = false;
		new_tab     = newTab;

    initHintMode();
    CmdBox.set({title : 'HintMode',pressDown : handleInput, content : ''});
  }

  function initHintMode() {
		elements  = [];

    // Get all visible elements
    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button, *[onclick]');
    for (var i = 0, j = elems.length; i < j; i++) {
      if (isElementVisible(elems[i])) { elements.push(elems[i]); }
    }
    setHintIndex(elements);
    matched = elements;
  }

  function removeHighlightBox(/* Boolean */ create_after_remove) {
    for (var i = 0, j = elements.length; i < j; i++) { elements[i].removeAttribute(highlight); }

    var div = document.getElementById('__vim_hint_highlight');
    if (div) { document.body.removeChild(div); }

    if (create_after_remove) {
      div = document.createElement('div');
      div.setAttribute('id', '__vim_hint_highlight');
      document.body.appendChild(div);
      return div;
    }
  }

  function setHintIndex(elems) {
    var div = removeHighlightBox(/* create_after_remove */ true);
    var win_top   = window.scrollY / Zoom.current();
    var win_left  = window.scrollX / Zoom.current();
    var frag = document.createDocumentFragment();
    for (var i = 0, j = elems.length; i < j; i++) { //TODO need refactor
      var elem      = elems[i];
      var pos       = elem.getBoundingClientRect();
      var elem_top  = win_top  + pos.top;
      var elem_left = win_left + pos.left;

      var span = document.createElement('span');
      span.setAttribute('id', '__vim_hint_highlight_span');
      span.style.left            = elem_left + 'px';
      span.style.top             = elem_top  + 'px';
      span.style.backgroundColor = 'red';
      span.innerHTML             = i + 1; // set number for available elements
      frag.appendChild(span);

      setHighlight(elem, /* set_active */ false);
    }
    div.appendChild(frag);
    if (elems[0] && elems[0].tagName == 'A') { setHighlight(elems[0], /* set_active */ true); }
  }

  function setHighlight(elem, set_active) {
    if (!elem) { return false; }

    if (set_active) {
      // Remove the old active element
      var active_elem = document.body.querySelector('a[' + highlight + '=hint_active]');
      if (active_elem) { active_elem.setAttribute(highlight, 'hint_elem'); }
      elem.setAttribute(highlight, 'hint_active');
    } else {
      elem.setAttribute(highlight, 'hint_elem');
    }
  }

  function remove() {
    if (!hintMode) { return false; }

    CmdBox.remove();
    removeHighlightBox();
		hintMode = false;
  }

  function handleInput(e) {
    key = getKey(e);

    // If user are inputing number
    if (/^\d$/.test(key) || (key == '<BackSpace>' && selected !== 0)) {
      selected = (key == '<BackSpace>') ? parseInt(selected / 10) : selected * 10 + Number(key);
			CmdBox.set({title : 'HintMode (' + selected + ')'});
      var index = selected - 1;

      setHighlight(matched[index], /* set_active */ true);
      currentHint = matched[index];
      e.preventDefault();

      if (selected * 10 > matched.length) {
        return execSelect(currentHint);
      }
    } else {
      // If key is not Accept key
			if (!isAcceptKey(key)) { CmdBox.set({title : 'HintMode'}); }
      // If key is not Escape key
      if (!isEscapeKey(key)) { setTimeout(delayToWaitKeyDown,20); }
    }
  }

  function hintMatch(elem, index) {
    var text   = elem.innerText;
    var filter = CmdBox.get().content.trimFirst([';','?','[','{']);

    var regexp = new RegExp(filter.trimFirst("!"),'im');
    var result = regexp.test(text) || regexp.test(PinYin.short(text)) || regexp.test(PinYin.full(text));
    return filter.startWith('!') ? !result : result;
  }

  function getCurrentAction() {
    var filter = CmdBox.get().content;

    if (filter.startWith(';')) {
      return focusElement;
    } else if (filter.startWith('?')) {
      return showElementInfo;
    } else if (filter.startWith('[')) {
      return copyElementUrl;
    } else if (filter.startWith('{')) {
      return copyElementText;
    } else {
      return null;
    }
  }

  function showElementInfo(elem) {
    CmdBox.set({title : elem.outerHTML});
  }

  function focusElement(elem) {
    elem.focus();
  }

  function copyElementUrl(elem) {
    var text = Url.fixRelativePath(elem.getAttribute('href'));
    Clipboard.copy(text);
    CmdBox.set({title : "[Copied] " + text, timeout : 4000 });
  }

  function copyElementText(elem) {
    var text = elem.innerText;
    Clipboard.copy(text);
    CmdBox.set({title : "[Copied] " + text, timeout : 4000 });
  }

  function delayToWaitKeyDown(){
    selected = 0;
    matched  = [];

    for (var i = 0, j = elements.length; i < j; i++) {
      if (hintMatch(elements[i], i)) {
        matched.push(elements[i]);
      }
    }

    setHintIndex(matched);

    if (isCtrlAcceptKey(key)) {
      for (var i = 0, j = matched.length; i < j; i++) {
        execSelect(matched[i]);
        new_tab = true;
      }
    } else if (isAcceptKey(key) || matched.length == 1) {
      execSelect(currentHint ? currentHint : matched[0]);
    }
    currentHint = false;
  }

  function execSelect(elem) {
    if (!elem) { return false; }
    var currentAction = getCurrentAction();

    var tag_name = elem.tagName.toLowerCase();
    var type     = elem.type ? elem.type.toLowerCase() : "";

    if (currentAction) {
      remove(); // No multi_mode for extend mode
      currentAction(elem);
    } else {
      if (tag_name == 'a') {
          setHighlight(elem, true);

          var options = {};
          options[Platform.mac ? 'meta' : 'ctrl'] = new_tab;
          clickElement(elem, options);
      } else if (elem.onclick || (tag_name == 'input' && (type == 'submit' || type == 'button' || type == 'reset' || type == 'radio' || type == 'checkbox'))) {
        clickElement(elem);

      } else if (tag_name == 'input' || tag_name == 'textarea') {
        try {
          elem.focus();
          elem.setSelectionRange(elem.value.length, elem.value.length);
        } catch(e) {
          clickElement(elem); // some website don't use standard submit input.
        }
      } else if (tag_name == 'select') {
        elem.focus();
      }

      if (!multi_mode) {
        setTimeout(remove,200);
      } else {
        selected = 0;
        CmdBox.set({title : 'HintMode'});
      }
    }
  }

  return {
    start            : start,
    new_tab_start    : function(){ start(/*new tab*/ true); },
    multi_mode_start : function(){ start(/*new tab*/ true, /*multi mode*/ true); },
    remove           : remove
  };
})();
