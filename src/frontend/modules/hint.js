var Hint = (function() {
  var currentHint, new_tab, multi_mode, hintMode, selected, elements, matched, key, clickedElems, isStringMode, hintKeys, subMatched, dupElements;
  var highlight = 'vrome_highlight';

  var subActions = {
    ';': focusElement,
    '?': showElementInfo,
    '[': copyElementUrl,
    '{': copyElementText,
    '/': 'search'
  }

  function start(newTab, multiMode, stringMode, prevContent) {
    isStringMode = false;
    hintMode = true;
    multi_mode = multiMode;
    selected = 0; // set current selected number
    currentHint = false;
    new_tab = newTab;
    clickedElems = []
    isStringMode = stringMode || Option.get('useletters') == 1
    hintKeys = Option.get('hintkeys')
    subMatched = []
    elements = []
    matched = []
    dupElements = {}

    initHintMode();

    if (isStringMode) {
      CmdBox.set({
        title: 'HintMode',
        pressUp: handleInput,
        content: prevContent ? prevContent : '',
        noHighlight: inRepeatMode(prevContent)
      });
    } else {
      CmdBox.set({
        title: 'HintMode',
        pressDown: handleInput,
        content: ''
      });
    }
  }

  function initHintMode() {
    elements = [];

    // Get all visible elements
    var elems = document.body.querySelectorAll('a, input:not([type=hidden]), textarea, select, button, *[onclick]');

    elements = _.select(elems, function(v) {
      return isElementVisible(v) && v && v.id != '_vrome_cmd_input_box'
    })

    setHintIndex(elements);
    matched = elements;
  }

  function removeHighlightBox( /* Boolean */ create_after_remove) {
    for (var i = 0, j = elements.length; i < j; i++) {
      elements[i].removeAttribute(highlight);
    }

    var div = document.getElementById('__vim_hint_highlight');
    if (div) {
      document.body.removeChild(div);
    }

    if (create_after_remove) {
      div = document.createElement('div');
      div.setAttribute('id', '__vim_hint_highlight');
      document.body.appendChild(div);
      return div;
    }
  }


  function setHintIndex(elems) {
    var div = removeHighlightBox( /* create_after_remove */ true);
    var win_top = window.scrollY / Zoom.current();
    var win_left = window.scrollX / Zoom.current();
    var frag = document.createDocumentFragment();
    var currentString = getCurrentString()

    var hintStrings = null;
    if (isStringMode) {
      // index of similar links so we generate the same hints for duplicates
      hintStrings = StringModeHelper.hintStrings(elems)

      subMatched = []
    }


    for (var i = 0, j = elems.length; i < j; i++) { //TODO need refactor
      var elem = elems[i];
      var pos = elem.getBoundingClientRect();
      var elem_top = win_top + pos.top;
      var elem_left = win_left + pos.left;

      var span = document.createElement('span');
      span.setAttribute('id', '__vim_hint_highlight_span');
      span.style.left = elem_left + 'px';
      span.style.top = elem_top + 'px';
      span.style.backgroundColor = 'red';

      if (isStringMode) {
        var mnemonic = hintStrings[i]

        subMatched[i] = mnemonic;
        span.setAttribute('class', '__vim_hint_highlight_span');

        mnemonic = StringModeHelper.updateMnemonic(mnemonic, currentString)

        if (mnemonic.length === 0) {
          continue; // do not add to frag if empty
        }

        span.innerHTML = mnemonic;
      } else {
        span.innerHTML = i + 1; // set number for available elements
      }


      frag.appendChild(span);
      setHighlight(elem, /* set_active */ false);
    }

    div.appendChild(frag);
    if (elems[0] && elems[0].tagName == 'A') {
      setHighlight(elems[0], /* set_active */ true);
    }
  }

  function setHighlight(elem, set_active) {
    if (!elem) {
      return false;
    }

    if (set_active) {
      // Remove the old active element
      var active_elem = document.body.querySelector('a[' + highlight + '=hint_active]');
      if (active_elem) {
        active_elem.setAttribute(highlight, 'hint_elem');
      }
      elem.setAttribute(highlight, 'hint_active');
    } else {
      elem.setAttribute(highlight, 'hint_elem');
    }
  }

  function remove() {
    if (!hintMode) {
      return false;
    }

    CmdBox.remove();
    removeHighlightBox();
    hintMode = false;
  }

  function getCurrentString() {
    var content = CmdBox.get().content;
    content = content.trim()

    if (getCurrentAction(content)) {
      content = content.substring(1)
    }

    return content;
  }

  /*
   * retrieves matched elements using string (string mode only)
   */

  function getMatchedElementsByString(str) {
    str = str.toLowerCase();
    var newMatched = [];

    var dupKeys = _.map(_.keys(dupElements), function(v) {
      return parseInt(v);
    })

    for (var i = 0; i < subMatched.length; i++) {
      var mnemonic = subMatched[i];
      // don't push the duplicates
      if (mnemonic.startsWith(str) && _.include(dupKeys, i) === false) {
        newMatched.push(elements[i]);
      }
    }

    return newMatched;
  }

  function handleInput(e) {
    key = getKey(e);

    var exec = false;


    // If user are inputing number
    if (/^\d$/.test(key) || (key == '<BackSpace>' && selected !== 0)) {
      selected = (key == '<BackSpace>') ? parseInt(selected / 10) : selected * 10 + Number(key);
      CmdBox.set({
        title: 'HintMode (' + selected + ')'
      });
      var index = selected - 1;

      setHighlight(matched[index], /* set_active */ true);

      if (selected * 10 > matched.length) {
        currentHint = matched[index];
        exec = true;
      }
    } else if (isStringMode) {
      if (getCurrentAction() === 'search') {
        setTimeout(delayToWaitKeyDown, 20);
      } else {
        var newMatched = getMatchedElementsByString(getCurrentString());
        setHintIndex(elements);

        if (newMatched.length == 1) {
          currentHint = newMatched[0];
          exec = true;
        }
      }
    } else {
      // If key is not Accept key
      if (!isAcceptKey(key)) {
        CmdBox.set({
          title: 'HintMode'
        });
      }
      // If key is not Escape key
      if (!isEscapeKey(key)) {
        setTimeout(delayToWaitKeyDown, 20);
      }
    }

    e.stopPropagation();
    if (exec) {
      e.preventDefault();
      return execSelect(currentHint)
    }
  }

  function hintMatch(elem, index) {
    var text = elem.innerText;
    var filter = CmdBox.get().content.trimFirst(getCurrentActionNames());

    if (isStringMode && getCurrentAction() === 'search') {
      filter = getCurrentString()
    }

    var regexp = new RegExp(filter.trimFirst("!"), 'im');
    var result = regexp.test(text) || regexp.test(PinYin.shortcut(text)) || regexp.test(PinYin.full(text));
    return filter.startWith('!') ? !result : result;
  }

  function getCurrentActionNames() {
    var names = _.keys(subActions);

    var aliases = (Option.get('hint_actions') && JSON.parse(Option.get('hint_actions'))) || []
    names = _.uniq(_.union(_.keys(aliases), names))

    return names;
  }

  function getCurrentAction(content) {
    var filter = content || CmdBox.get().content;
    var actionName = filter.substring(0, 1);

    // get the alias associated to this action e.g use @ instead of [
    var aliases = Option.get('hint_actions') && JSON.parse(Option.get('hint_actions'))
    actionName = (aliases && aliases[actionName]) || actionName

    return subActions[actionName];
  }

  function showElementInfo(elem) {
    CmdBox.set({
      title: elem.outerHTML
    });
  }

  function focusElement(elem) {
    elem.focus();
  }

  function copyElementUrl(elem) {
    var text = Url.fixRelativePath(elem.getAttribute('href'));
    Clipboard.copy(text);
    CmdBox.set({
      title: "[Copied] " + text,
      timeout: 4000
    });
  }

  function copyElementText(elem) {
    var text = elem.innerText;
    Clipboard.copy(text);
    CmdBox.set({
      title: "[Copied] " + text,
      timeout: 4000
    });
  }

  function delayToWaitKeyDown() {
    selected = 0;
    matched = [];

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
    if (!elem || (elem && _.include(clickedElems, elem))) {
      return false;
    }
    var currentAction = getCurrentAction();

    var tag_name = elem.tagName.toLowerCase();
    var type = elem.type ? elem.type.toLowerCase() : "";

    if (currentAction && _.isFunction(currentAction)) {
      remove(); // No multi_mode for extend mode
      currentAction(elem);
    } else {
      if (tag_name == 'a') {
        setHighlight(elem, true);

        var options = {};
        options[Platform.mac ? 'meta' : 'ctrl'] = new_tab;
        clickElement(elem, options);
      } else if (tag_name == 'input' || tag_name == 'textarea') {
        try {
          elem.selectionEnd; // this will trigger an error for checkboxes and other non text elements and therefore trigger a click instead
          elem.focus();
          elem.setSelectionRange(elem.value.length, elem.value.length);
        } catch (e) {
          clickElement(elem); // some website don't use standard submit input.
        }
      } else if (elem.onclick || (tag_name == 'input' && (type == 'submit' || type == 'button' || type == 'reset' || type == 'radio' || type == 'checkbox')) || tag_name == 'button') {
        clickElement(elem);
      } else if (tag_name == 'select') {
        elem.focus();
      }

      clickedElems.push(elem);

      var oldContent = getCurrentString();
      if (isStringMode && (inRepeatMode(oldContent))) {
        // repeat if the first character is uppercase or we are in multi mode
        repeatHintMode()
      } else if (multi_mode && !isStringMode) {
        selected = 0;
        CmdBox.set({
          title: 'HintMode'
        });
      } else {
        setTimeout(remove, 200);
      }
    }
  }

  function inRepeatMode(currentString) {
    if (!currentString) {
      currentString = getCurrentString()
    }

    return (new_tab && currentString.charAt(0).isUpperCase()) || multi_mode;
  }

  function repeatHintMode() {
    var currentString = getCurrentString()
    CancelKeyFunction()

    var res = _.select(currentString.split(''), function(v) {
      return v.isUpperCase()
    }).join('')

    start(true, multi_mode, true, res)
    getMatchedElementsByString(res);
    setHintIndex(elements);
  }

  function isExperimental() {
    // runs experimental code. not yet 100% stable for production
    // code using isExperimental can be easily refactored later on
    return hintKeys.indexOf(',') !== -1;
  }

  var StringModeHelper = {

    getDuplicatedElements: function(elems) {
      var res = {}
      var hrefs = {}
      for (var i = 0, j = elems.length; i < j; i++) {
        var elem = elems[i]
        if (elem && elem.tagName == 'A') {
          var href = elem.getAttribute('href')
          // same link found
          if (hrefs[href] !== undefined) {
            var oriElem = elements[hrefs[href]]

            // same onclick code + same event listeners. This is the exact same element. Use same hints
            if (oriElem && oriElem.onclick === elem.onclick && typeof oriElem.listEventListeners === typeof elem.listEventListeners) {

              if (oriElem.listEventListeners && elem.listEventListeners) {
                if (Object.keys(oriElem.listEventListeners).length === Object.keys(elem.listEventListeners).length && _.difference(Object.keys(oriElem.listEventListeners), Object.keys(elem.listEventListeners)).length === 0) {
                  res[i] = hrefs[href]
                }

              } else {

                res[i] = hrefs[href]
              }
            }
          } else {
            hrefs[href] = i;
          }
        }
      }

      return res;
    },

    logXOfBase: function(x, base) {
      return Math.log(x) / Math.log(base);
    },

    /*
     * Returns a list of hint strings which will uniquely identify the given number of links. The hint strings
     * may be of different lengths.
     */
    hintStrings: function(elems) {
      var linkCount = elems.length;
      var linkHintCharacters = hintKeys;

      // provided two sets of hint keys e.g dsafrewq,tgcx  We try to use the first for combinations as much as possible
      // second set is for keys that are too far away but necessary to avoid 3 letters combinations
      if (hintKeys.indexOf(',') != -1) {
        var arrhintKeys = hintKeys.split(',');
        if (linkCount <= arrhintKeys[0].length) {
          linkHintCharacters = arrhintKeys[0]
        } else {
          linkHintCharacters = arrhintKeys[1] + arrhintKeys[0]
        }
      }

      // Determine how many digits the link hints will require in the worst case. Usually we do not need
      // all of these digits for every link single hint, so we can show shorter hints for a few of the links.
      var digitsNeeded = Math.ceil(this.logXOfBase(linkCount, linkHintCharacters.length));

      // Short hints are the number of hints we can possibly show which are (digitsNeeded - 1) digits in length.
      var shortHintCount = Math.floor(
      (Math.pow(linkHintCharacters.length, digitsNeeded) - linkCount) / linkHintCharacters.length);
      var longHintCount = linkCount - shortHintCount;

      var hintStrings = [];

      if (digitsNeeded > 1) for (var i = 0; i < shortHintCount; i++)
      hintStrings.push(this.numberToHintString(i, digitsNeeded - 1, linkHintCharacters));

      var start = shortHintCount * linkHintCharacters.length;
      for (i = start; i < start + longHintCount; i++)
      hintStrings.push(this.numberToHintString(i, digitsNeeded, linkHintCharacters));

      dupElements = StringModeHelper.getDuplicatedElements(elems)

      if (multi_mode && isExperimental()) {
        hintStrings = this.sortBySimilarity(hintStrings, elems);
      }

      hintStrings = this.fixDuplicates(hintStrings);

      return hintStrings;
    },

    getSimilarityScore: function(str1, str2) {
      if (!str1 || !str2 || str1 === "" || str2 === "") {
        return null;
      }

      var strl = null
      var strs = null

      // find long + short string
      if (str1.length >= str2.length) {
        strl = str1;
        strs = str2;
      } else {
        strl = str2
        strs = str1
      }

      var nbInvalids = 0;
      var matches = {}

      for (var i = 0; i < strl.length; i++) {
        var strlc = strl.charAt(i)

        var start = 0;
        if (matches[strlc]) start = matches[strlc]

        var posi = strs.indexOf(strlc, start)

        if (posi === -1) {
          nbInvalids++;
        }
      }

      var score = (strs.length - nbInvalids) / strl.length * 100;
      return score;
    },

    buildSimilarityIndex: function(elems) {
      var maxScore = 70;
      var index = {}

      // loop through elements + group them by similarity
      _.each(elems, function(v, k) {
        var pushed = false
        _.each(index, function(iv, ik) {
          if (pushed || v.tagName !== elems[ik].tagName) return;
          var score1 = 0;

          if (v.tagName === 'A') {
            score1 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].getAttribute('href'), v.getAttribute('href')))
            var score2 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].innerText, v.innerText))
            if (score2 > maxScore) score1 = (score1 + score2) / 2
          } else {
            score1 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].outerHTML, v.outerHTML))
          }
          if (score1 > maxScore) {
            index[ik].push(k)
            pushed = true
          }
        })
        index[k] = []
      })


      // remove empty ones from index -- no similar matches
      _.each(index, function(v, k) {
        if (v.length === 0) {
          delete index[k];
        }
      })

      // merge similar groups + close matches
      _.each(index, function(v, k) {
        for (var i = 0; i < v.length; i++) {
          var id = v[i];
          if (index[id]) {
            v.push(index[id]);
            delete index[id];
          } else {
            _.each(index, function(v2, k2) {
              if (k2 != k && _.include(v2, id)) {
                v.push(index[k2])
                v.push(k2);
                delete index[k2];
              }
            })
          }
        }
      })

      // flatten it + make them unique
      _.each(index, function(v, k) {
        index[k] = _.unique(_.flatten(v))
        index[k].push(parseInt(k))
      })

      return index
    },

    // sort elements by a similarity score and assigns hints starting by the same letter
    // e.g links like "comments (20)", "comments (50)", "comments (55)" will start by the same letter e.g S
    // this way the user can open multiple links highly related very quickly
    sortBySimilarity: function(hintStrings, elems) {
      var index = this.buildSimilarityIndex(elems)

      // create an index matching the new keys to the elements
      if (_.size(index) > 0) {
        var hindex = {}
        var usedLetters = []

        var done = false;
        while (!done) {
          done = true;
          var ids = _.max(index, function(v) {
            return v.length;
          })
          if (ids !== undefined) {
            var lastHs = null;
            _.each(hintStrings, function(hs, hsk) {
              if (hs.length > 1 && !_.include(usedLetters, hs.charAt(0)) && !_.include(_.values(hindex), hsk) && ids.length > 0) {
                var id = _.first(ids);
                hindex[parseInt(id)] = parseInt(hsk)
                delete index[id]
                ids.shift()
                lastHs = hs;
                done = false
              }
            })

            if (lastHs) {
              usedLetters.push(lastHs.charAt(0))
            }
          }
        }

        // rebuild the hint strings using the new matches
        var hs = {}
        var newhs = []

        _.each(hindex, function(v, k) {
          hs[k] = hintStrings[v]
        })

        // add whatever is left
        var remaining = _.difference(hintStrings, _.values(hs))
        _.times(hintStrings.length, function(k) {
          if (hs[k] === undefined) {
            hs[k] = remaining.shift()
          }
        })

        _.times(_.size(hs), function(k) {
          newhs.push(hs[k])
        })

        hintStrings = newhs;
      }

      return hintStrings;
    },

    fixDuplicates: function(hintStrings) {
      // remove any duplicates
      return _.map(hintStrings, function(v, k) {
        if (dupElements[k] !== undefined) {
          return hintStrings[dupElements[k]]
        } else {
          return hintStrings[k]
        }
      })

    },

    /*
     * This shuffles the given set of hints so that they're scattered -- hints starting with the same character
     * will be spread evenly throughout the array.
     */
    shuffleHints: function(hints, characterSetLength) {
      var buckets = [],
        i = 0;
      for (i = 0; i < characterSetLength; i++)
      buckets[i] = []
      for (i = 0; i < hints.length; i++)
      buckets[i % buckets.length].push(hints[i]);
      var result = [];
      for (i = 0; i < buckets.length; i++)
      result = result.concat(buckets[i]);
      return result;
    },


    /*
     * Converts a number like "8" into a hint string like "JK". This is used to sequentially generate all of
     * the hint text. The hint string will be "padded with zeroes" to ensure its length is equal to numHintDigits.
     */
    numberToHintString: function(number, numHintDigits, characterSet) {
      var base = characterSet.length;
      var hintString = [];
      var remainder = 0;
      do {
        remainder = number % base;
        hintString.unshift(characterSet[remainder]);
        number -= remainder;
        number /= Math.floor(base);
      } while (number > 0);

      // Pad the hint string we're returning so that it matches numHintDigits.
      // Note: the loop body changes hintString.length, so the original length must be cached!
      var hintStringLength = hintString.length;
      for (var i = 0; i < numHintDigits - hintStringLength; i++)
      hintString.unshift(characterSet[0]);

      return hintString.join("");
    },

    updateMnemonic: function(mnemonic, currentString) {
      if (currentString !== null && currentString.length > 0) {
        currentString = currentString.toLowerCase();

        if (mnemonic.startsWith(currentString)) {
          mnemonic = mnemonic.replace(currentString, '');
        } else {
          mnemonic = '';
        }
      }

      return mnemonic;
    }
  }

  return {
    start: start,
    new_tab_start: function() {
      start( /*new tab*/ true);
    },
    multi_mode_start: function() {
      start( /*new tab*/ true, /*multi mode*/ true);
    },
    start_string: function() {
      start(false, false, true)
    },
    new_tab_start_string: function() {
      start(true, false, true)
    },
    multi_mode_start_string: function() {
      start(true, true, true)
    },
    remove: remove
  };
})();
