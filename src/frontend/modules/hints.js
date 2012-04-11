var Hints = (function() {
  var currentHint, new_tab, hintMode, repeat, stringMode, numbers, elements, matched, subMatched;
  var highlight = 'vrome_highlight';
  var linkHintCharacters = 'dsafrewqtgvcxz';
  var key = null;

  var actions = {
    '@': copyURLAction,
    ';': copyTextAction,
    ',': focusOnElementAction
  };

  var currentAction = null;

  function start(newTab, isStringMode, isRepeat) {
    hintMode = true;
    var config = Settings.get('configure.set.linkHintCharacters');
    if (config) {
      linkHintCharacters = config[0];
    }

    numbers = 0;
    currentHint = false;
    currentAction = null;
    stringMode = isStringMode;
    repeat = isRepeat;
    new_tab = newTab;
    key = null;
    setHints();

    if (isStringMode) CmdBox.set({
      title: 'HintMode',
      pressUp: handleInput,
      content: ''
    });
    else CmdBox.set({
      title: 'HintMode',
      pressDown: handleInput,
      content: ''
    });
  }

  function setHints() {
    elements = [];

    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button, *[onclick]');
    for (var i = 0; i < elems.length; i++) {
      if (isElementVisible(elems[i])) {
        if (elems[i].id != "_vrome_cmd_input_box") elements.push(elems[i]);
      }
    }

    if (repeat) {
      elements = experimentalSorting(elements);
    }

    setOrder(elements);
    matched = elements;
  }

  function experimentalSorting(elems) {
    var sortedElems = [];

    for (var i = 0; i < elems.length; i++) {
      var elem = elems[i];
      var tag_name = elem.tagName.toLowerCase();
      var pushed = false;
      if (tag_name == "a" && elem.getAttribute('href')) {
        var closestElement = null;
        var greatestPercent = 0;

        // find closest element -- most similar based on href
        for (var j = 0; j < sortedElems.length; j++) {
          var sortedElem = sortedElems[j];

          if (sortedElem.tagName.toLowerCase() == "a" && sortedElem.getAttribute('href')) {
            var percent = getSimilarityPercent(sortedElem.getAttribute('href'), elem.getAttribute('href'));
            if (percent > greatestPercent) {
              greatestPercent = percent;
              closestElement = sortedElem;
            }
          }
        }

        if (closestElement && greatestPercent > 70) {
          if (!closestElement.els) {
            closestElement.els = [];
          }

          closestElement.els.push(elem);
          pushed = true;
        }
      }

      if (!pushed) {
        sortedElems.push(elem);
      }
    }

    var res = [];
    for (var i in sortedElems) {
      if (sortedElems[i].els) {
        res.push(sortedElems[i]);
        for (var j = 0; j < sortedElems[i].els.length; j++) {
          res.push(sortedElems[i].els[j]);
        }
        sortedElems[i].els = undefined;
        delete sortedElems[i];
        //                sortedElems.splice(i, 1);
      }
    }

    for (var i in sortedElems) {
      res.push(sortedElems[i]);
    }
    elements = res;
    elems = res;

    return res;
  }

  function setOrder(elems) {
    subMatched = [];
    var numDigits = calculateNumHintDigits(elements.length, linkHintCharacters.length);

    // clean up old highlight.
    for (var i = 0; i < elements.length; i++) {
      elements[i].removeAttribute(highlight);
    }

    var div = document.getElementById('__vim_hint_highlight');
    if (div) document.body.removeChild(div);

    div = document.createElement('div');
    div.setAttribute('id', '__vim_hint_highlight');
    document.body.appendChild(div);

    var currentString = getCurrentString();

    for (var i = 0; i < elems.length; i++) { //TODO need refactor
      var elem = elems[i];
      var win_top = window.scrollY / Zoom.current();
      var win_left = window.scrollX / Zoom.current();
      var pos = elem.getBoundingClientRect();
      var elem_top = win_top + pos.top;
      var elem_left = win_left + pos.left;

      var span = document.createElement('span');
      span.setAttribute('class', '__vim_hint_highlight_span');
      span.style.left = elem_left + 'px';
      span.style.top = elem_top + 'px';
      span.style.backgroundColor = 'red';

      var htmlNumber = Number(i) + 1; // cur
      if (stringMode) {
        var mnemonic = numberToHintString(htmlNumber, numDigits);
        subMatched[i] = mnemonic;

        // filter based on input
        if (currentString !== null && currentString.length > 0) {
          currentString = currentString.toLowerCase();

          if (mnemonic.startsWith(currentString)) {
            mnemonic = mnemonic.replace(currentString, '');
          } else {
            mnemonic = '';
          }
        }

        span.innerHTML = mnemonic.toUpperCase();
      } else {
        span.innerHTML = htmlNumber;
      }

      if (span.innerHTML !== '') div.appendChild(span);

      setHighlight(elem, false);
    }
    if (elems[0] && elems[0].tagName == 'A') {
      setHighlight(elems[0], true);
    }
  }

  function setHighlight(elem, is_active) {
    if (!elem) {
      return false;
    }

    if (is_active) {
      var active_elem = document.body.querySelector('a[' + highlight + '=hint_active]');
      if (active_elem) {
        active_elem.setAttribute(highlight, 'hint_elem');
      }
      elem.setAttribute(highlight, 'hint_active');
    } else {
      elem.setAttribute(highlight, 'hint_elem');
    }
  }

  /*
   * Converts a number like "8" into a hint string like "JK". This is used to sequentially generate all of
   * the hint text. The hint string will be "padded with zeroes" to ensure its length is equal to numHintDigits.
   */

  function numberToHintString(number, numHintDigits) {
    var base = linkHintCharacters.length;
    var hintString = [];
    var remainder = 0;
    do {
      remainder = number % base;
      hintString.unshift(linkHintCharacters[remainder]);
      number -= remainder;
      number /= Math.floor(base);
    } while (number > 0);

    // Pad the hint string we're returning so that it matches numHintDigits.
    var hintStringLength = hintString.length;
    for (var i = 0; i < numHintDigits - hintStringLength; i++)
    hintString.unshift(linkHintCharacters[0]);
    return hintString.join("");
  }

  function calculateNumHintDigits(countVisibleElements, countLinkHintCharacters) {
    return Math.ceil(Math.log(countVisibleElements) / Math.log(countLinkHintCharacters));
  }

  /*
   * retrieves matched elements using string (string mode only)
   */

  function getMatchedElementsByString(str) {
    str = str.toLowerCase();
    var newMatched = [];
    for (var i = 0; i < subMatched.length; i++) {
      var mnemonic = subMatched[i];
      if (mnemonic.startsWith(str)) {
        newMatched.push(elements[i]);
      }
    }

    return newMatched;
  }

  function getCurrentString() {
    var content = CmdBox.get().content;

    for (actionStarter in actions) {
      if (content.startsWith(actionStarter)) {
        currentAction = actions[actionStarter];
        content = content.substr(1);
        break;
      }
    }

    return content;
  }

  function getCurrentAction() {
    var content = CmdBox.get().content;
    for (actionStarter in actions) {
      if (content.startsWith(actionStarter)) {
        currentAction = actions[actionStarter];
        break;
      }
    }

    return currentAction;
  }

  function updateCmdBoxForRepeat() {
    // keep upper case letters
    var content = CmdBox.get().content;
    var res = '';
    for (var i = 0; i < content.length; i++) {
      if (content.charCodeAt(i) >= 65 && content.charCodeAt(i) <= 90) {
        res += content[i];
      }
    }

    CmdBox.set({
      content: res
    });
    getMatchedElementsByString(getCurrentString());
    setOrder(elements);
  }

  function remove() {
    if (!hintMode) return;

    if (currentAction == null) {
      CmdBox.remove();
    }
    hintMode = false;

    for (var i = 0; i < elements.length; i++) {
      elements[i].removeAttribute(highlight);
    }

    var div = document.getElementById('__vim_hint_highlight');
    if (div) {
      document.body.removeChild(div);
    }
  }

  function handleInput(e) {
    key = getKey(e);

    if (isAcceptKey(key)) {
      processActions();
    } else if (stringMode) {
      var currentString = getCurrentString();


      var newMatched = getMatchedElementsByString(currentString);
      setOrder(elements);

      if (newMatched.length == 1) {
        currentHint = newMatched[0];
        e.preventDefault();

        return execSelect(currentHint);
      }
    } else {
      if (/^\d$/.test(key) || (key == '<BackSpace>' && numbers != 0)) {
        numbers = (key == '<BackSpace>') ? parseInt(numbers / 10) : numbers * 10 + Number(key);
        CmdBox.set({
          title: 'HintMode (' + numbers + ')'
        });
        var cur = numbers - 1;

        setHighlight(matched[cur], true);
        currentHint = matched[cur];
        e.preventDefault();

        if (numbers * 10 > matched.length) {
          return execSelect(currentHint);
        }
      } else {
        if (isAcceptKey(key)) CmdBox.set({
          title: 'HintMode'
        });
        if (!isEscapeKey(key)) setTimeout(delayToWaitKeyDown, 200);
      }
    }
  }

  function delayToWaitKeyDown() {
    numbers = 0;
    matched = [];

    for (var i in elements) {
      if (new RegExp(CmdBox.get().content, 'im').test(elements[i].innerText)) {
        matched.push(elements[i]);
      }
    }

    setOrder(matched);

    if (isAcceptKey(key) || matched.length == 1) {
      return execSelect(currentHint ? currentHint : matched[0]);
    }
    currentHint = false;
  }

  function execSelect(elem) {
    if (!elem) {
      return false;
    }
    var tag_name = elem.tagName.toLowerCase();
    var type = elem.type ? elem.type.toLowerCase() : "";

    if (tag_name == 'a') {
      setHighlight(elem, true);

      var old_target = elem.getAttribute('target');
      elem.removeAttribute('target');

      var options = {};
      options[Platform.mac ? 'meta' : 'ctrl'] = new_tab;

      if (getCurrentAction() == null) {
        clickElement(elem, options);
      } else {
        currentAction.apply('', [elem]);
      }

      if (old_target) elem.setAttribute('target', old_target);
    } else if (elem.onclick && type != 'text') {
      clickElement(elem);
    } else if ((tag_name == 'input' && (type == 'submit' || type == 'button' || type == 'reset' || type == 'radio' || type == 'checkbox')) || tag_name == 'button') {
      clickElement(elem);
    } else if (tag_name == 'input' || tag_name == 'textarea') {
      try {
        elem.focus();
        elem.setSelectionRange(elem.value.length, elem.value.length);
      } catch (e) {
        clickElement(elem); // some website don't use standard submit input.
      }
    } else if (tag_name == 'select') {
      elem.focus();
    }

    var oldContent = getCurrentString();
    var firstCharIsUpperCase = oldContent.charCodeAt(0) >= 65 && oldContent.charCodeAt(0) <= 90;
    if ((!new_tab || !firstCharIsUpperCase) && !repeat) {
      remove();
    } else if ((new_tab && firstCharIsUpperCase) || repeat) {
      start(true, true, repeat);
      CmdBox.set({
        content: oldContent
      });
      updateCmdBoxForRepeat();
    }

  }


  // actions


  function processActions() {
    // check which action it is
    var str = getCurrentString();

    if (str.startsWith("<")) {
      processComparisonOperatorAction("<", str);
    } else if (str.startsWith(">")) {
      processComparisonOperatorAction(">", str);
    }
  }

  function processComparisonOperatorAction(operator, str) {
    var value = str.substring(1);
    new_tab = true;

    for (var index in elements) {
      var elem = elements[index];
      var tagName = elem.tagName.toLowerCase();

      if (tagName == "a" && elem.innerText.match(/\d+/)) {
        var matches = elem.innerText.match(/\d+/);
        var valid = false;
        if (operator == ">") {
          valid = matches[0] && matches[0] > value;
        } else if (operator == "<") {
          valid = matches[0] && matches[0] < value;
        }

        if (valid) {
          execSelect(elem);
        }
      }
    }
  }


  function focusOnElementAction(elem) {
    elem.focus();
    currentAction = null;
  }

  function copyURLAction(elem) {
    var url = elem.getAttribute('href');

    var options = {};
    options[Platform.mac ? 'meta' : 'ctrl'] = true;

    Post({
      action: "Tab.copyData",
      data: elem.href
    });

    currentAction = null;
    Hint.remove();
  }

  function copyTextAction(elem) {
    Post({
      action: "Tab.copyData",
      data: elem.innerText
    });

    currentAction = null;
    Hint.remove();
  }

  return {
    start: start,
    start_string: function() {
      start(false, true);
    },
    new_tab_start: function() {
      start(true);
    },
    new_tab_start_string: function() {
      start(true, true);
    },
    new_tab_start_string_repeat: function() {
      start(true, true, true);
    },
    remove: remove
  };
})();
