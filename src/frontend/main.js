var cmds = {
  'global': {
    'Help.show': {
      t: 'Help',
      k: ['F1']
    },
    'AcceptKeyFunction': {
      t: 'Submit input',
      k: ["<Enter>", "<C-j>", "<C-m>"]
    },
    'CancelKeyFunction': {
      t: 'Cancel action',
      k: ["<Esc>", "<C-[>"]
    },
    'CtrlEscapeKeyFunction': {
      t: 'Enable Vrome when in pass-through',
      k: ["<C-Esc>"]
    },
    'Page.styleDisable': {
      t: 'Toggle Chrome CSS',
      d: "Copy custom CSS file to the browser\n\
            User StyleSheets directory",
      k: 'Sd',
      o: {
        'ccc_file': 'alias of chrome_custom_css_file',
        'chrome_custom_css_file': 'full path CSS file (filesystem or URL)'
      },
      s: 1
    },
    'Dialog.openCurrentNewTab': {
      t: 'Open selected URL in new tab',
      d: 'When in a dialog, Open selected URL (highlighted background) in a new tab',
      k: '<C-Enter>',
      i: 1,
      both: 1
    }
  },
  'zoom': {
    'Zoom.zoomIn': {
      t: 'in',
      k: 'zi',
      c: 1
    },
    'Zoom.out': {
      t: 'out',
      k: 'zo',
      c: 1
    },
    'Zoom.reset': {
      t: 'reset',
      k: 'zz'
    }
  },
  'scroll': {
    'Scroll.top': {
      t: 'Go to top',
      d: 'Scroll to the top of the page',
      k: 'gg'
    },
    'Scroll.bottom': {
      t: 'Go to bottom',
      d: 'Scroll to the bottom of the page',
      k: 'G'
    },
    'Scroll.first': {
      t: 'Go to beginning',
      d: 'Scroll to the beginning of the page',
      k: '0'
    },
    'Scroll.last': {
      t: 'Go to end',
      d: 'Scroll to the end of the page',
      k: '$'
    },
    'Scroll.toPercent': {
      t: 'Go to %',
      d: 'Scroll to {count}% of the page',
      k: '%',
      c: 1
    },
    'Scroll.up': {
      t: 'scroll up',
      k: 'k',
      c: 1
    },
    'Scroll.down': {
      t: 'scroll down',
      k: 'j',
      c: 1
    },
    'Scroll.left': {
      t: 'scroll left',
      k: 'h',
      c: 1
    },
    'Scroll.right': {
      t: 'right',
      k: 'l',
      c: 1
    },
    'Scroll.nextPage': {
      t: 'Scroll page forward',
      k: '<C-f>',
      c: 1
    },
    'Scroll.prevPage': {
      t: 'Scroll page backward',
      k: '<C-b>',
      c: 1
    },
    'Scroll.nextHalfPage': {
      t: 'Scroll half page forward',
      k: '<C-d>',
      c: 1
    },
    'Scroll.prevHalfPage': {
      t: 'scroll half page backward',
      k: '<C-u>',
      c: 1
    }
  },
  'page': {
    // TODO: rethink
    'Page.next': {
      t: 'Paginate forward',
      k: ']]',
      o: {
        'nextpattern': 'Pattern(s) to match URLs'
      }
    },
    // TODO: rethink
    'Page.prev': {
      t: 'Paginate backward',
      k: '[[',
      o: {
        'previouspattern': 'Pattern(s) to match URLs'
      }
    },
    'Page.copySelected': {
      t: 'Copy selected text',
      k: 'Y'
    },
    'Frame.next': {
      t: 'Next frame',
      k: ']f',
      c: 1
    },
    'Frame.prev': {
      t: 'Previous frame',
      k: '[f',
      c: 1
    },
    'Url.viewSource': {
      t: 'View source',
      k: 'gf'
    },
    'Url.viewSourceNewTab': {
      t: 'View source in new tab',
      k: 'gF'
    }
  },
  'url': {
    'Url.parent': {
      t: 'Go to parent',
      k: 'gu',
      c: 1
    },
    'Url.root': {
      t: 'go to root',
      k: 'gU'
    },
    'Page.editURLInExternalEditor': {
      t: 'edit URL in external editor',
      k: 'Ue',
      s: 1
    },
    'Url.increment': {
      t: 'Increment parameter',
      k: '<C-a>',
      c: 1
    },
    'Url.decrement': {
      t: 'decrement parameter',
      k: '<C-x>',
      c: 1
    },
    // TODO: rethink
    'Url.open': {
      t: 'Open URLs or search',
      d: 'Open URLs from your history, bookmarks, navigation or makes a search. \n\
Use <C-[0-9]> (red numbers) to open multiple links\n\
Use arrows to move Up and Down (view options)\n\
Supports relative paths e.g ../admin',
      k: 'o',
      o: {
        'noautocomplete': 'Disable autocomplete',
        'searchengines': 'JSON of search engines',
        'defaultsearch': 'Default search engine name',
        'autocomplete_prev': 'Previous',
        'autocomplete_next': 'Next',
        'autocomplete_next_10': 'Next 10',
        'autocomplete_prev_10': 'Previous 10'
      }
    },
    // TODO: rethink
    'Url.openWithDefault': {
      t: 'Open URLs or search (edit current URL)',
      d: 'Same as `o`',
      k: 'O'
    },
    'Url.tabopen': {
      t: 'Open URLs or search in a new tab',
      d: 'Same as `o`',
      k: 't'
    },
    'Url.tabopenWithDefault': {
      t: 'Open URLs or search in a new tab (edit current URL)',
      d: 'Same as `o`',
      k: 'T'
    },
    'Url.shortUrl': {
      t: 'Shorten URL',
      d: 'Shorten URL and copy in clipboard',
      k: '<C-y>'
    },
    'Url.openFromClipboard': {
      t: 'Open clipboard content',
      d: 'Go to URL or make a search',
      k: 'p'
    },
    'Url.openFromClipboardNewTab': {
      t: 'Open clipboard content in new tab',
      d: 'Same as `p`',
      k: 'P'
    }
  }
}

//_.each(cmds, function(commands, catName) {
//  _.each(commands, function(info, cmdName) {
//    var isFunction = typeof eval(cmdName) === 'function'
//    if (!isFunction) alert(cmdName + ' is not a function')
//  })
//})
var AcceptKey = cmds['global']['AcceptKeyFunction'].k
var CancelKey = cmds['global']['CancelKeyFunction'].k
var EscapeKey = cmds['global']['CancelKeyFunction'].k
var CtrlEscapeKey = cmds['global']['CtrlEscapeKeyFunction'].k

function isCtrlAcceptKey(key) {
  if (key == '<C-Enter>') {
    return true;
  }

  return false;
}

function isAcceptKey(key) {
  for (var i = 0; i < AcceptKey.length; i++) {
    if (AcceptKey[i] == key) {
      return true;
    }
  }

  return false;
}

function isEscapeKey(key) {
  for (var i = 0; i < EscapeKey.length; i++) {
    if (EscapeKey[i] == key) {
      return true;
    }
  }

  return false;
}

function isCtrlEscapeKey(key) {
  if (Option.get('enable_vrome_key') == key) {
    return true;
  }
  for (var i = 0; i < CtrlEscapeKey.length; i++) {
    if (CtrlEscapeKey[i] == key) {
      return true;
    }
  }

  return false;
}

function AcceptKeyFunction() {
  Search.next();

  Dialog.openCurrent();

  Buffer.gotoFirstMatchHandle();
  Buffer.deleteMatchHandle();
}

function CancelKeyFunction() {
  Hint.remove();
  InsertMode.blurFocus();
  KeyEvent.reset();
  Search.stop();
  Dialog.stop(true);
  CmdBox.remove();
  Help.hide()
}

function EscapeKeyFunction() {
  CancelKeyFunction();
}

function CtrlEscapeKeyFunction() {
  KeyEvent.enable();
  EscapeKeyFunction();
}

with(KeyEvent) {
  var arr = ["AcceptKey", "CancelKey", "EscapeKey", "CtrlEscapeKey"];
  for (var i = 0; i < arr.length; i++) {
    var keys = window[arr[i]];
    for (var j = 0; j < keys.length; j++) {
      add(keys[j], window[arr[i] + "Function"]);
      add(keys[j], window[arr[i] + "Function"], true);
    }
  }

  add("<F1>", Help.show);

  // Zoom
  add("zi", Zoom.zoomIn);
  add("zo", Zoom.out);
  add("zz", Zoom.reset);


  // Page
  add("Sd", Page.styleDisable)
  add("]]", Page.next);
  add("[[", Page.prev);
  add("Y", Page.copySelected);
  add("]f", Frame.next);
  add("[f", Frame.prev);


  // Url
  add("Ue", Page.editURLInExternalEditor)
  add("gu", Url.parent);
  add("gU", Url.root);
  add("gf", Url.viewSource);
  add("gF", Url.viewSourceNewTab);
  add("<C-a>", Url.increment);
  add("<C-x>", Url.decrement);
  add("o", Url.open);
  add("O", Url.openWithDefault);
  add("t", Url.tabopen);
  add("T", Url.tabopenWithDefault);
  add("<C-y>", Url.shortUrl);
  add("p", Url.openFromClipboard);
  add("P", Url.openFromClipboardNewTab);

  add("<C-Enter>", Dialog.openCurrentNewTab);
  add("<C-Enter>", Dialog.openCurrentNewTab, true);


  // Scroll
  add("gg", Scroll.top);
  add("G", Scroll.bottom);
  add("0", Scroll.first);
  add("$", Scroll.last);

  add("k", Scroll.up);
  add("j", Scroll.down);
  add("h", Scroll.left);
  add("l", Scroll.right);
  add("%", Scroll.toPercent);

  add("<C-f>", Scroll.nextPage);
  add("<C-b>", Scroll.prevPage);
  add("<C-d>", Scroll.nextHalfPage);
  add("<C-u>", Scroll.prevHalfPage);


  // Tab
  add("r", Tab.reload);
  add("<C-r>", Tab.reloadWithoutCache);
  add("R", Tab.reloadAll);

  add("dc", Tab.close);
  add("dm", Buffer.deleteMatch);
  add("do", Tab.closeOtherTabs);
  add("dl", Tab.closeLeftTabs);
  add("dr", Tab.closeRightTabs);
  add("dp", Tab.closeUnPinnedTabs);
  add("dP", Tab.closePinnedTabs);


  add("D", Tab.closeAndFoucsLeft);
  add("<M-d>", Tab.closeAndFoucsLast);

  add("u", Tab.reopen);

  add("<C-p>", Tab.prev);
  add("<C-n>", Tab.next);
  add("gt", Tab.next);
  add("gT", Tab.prev);

  add("gp", Tab.togglePin);
  add("gd", Tab.duplicate);
  add("gD", Tab.detach);
  add("gI", Tab.openInIncognito);
  add("gq", Tab.moveLeft)
  add("ge", Tab.moveRight)
  add("gP", Tab.unpinAllTabsInCurrentWindow)
  add("WP", Tab.unpinAllTabsInAllWindows)
  add("dW", Tab.closeOtherWindows)
  add("gm", Tab.markForMerging)
  add("gM", Tab.markAllForMerging)
  add("gv", Tab.putMarkedTabs)

  add("y", Tab.copyUrl);
  add("g0", Tab.first);
  add("g^", Tab.first);
  add("g$", Tab.last);
  add("gl", Tab.selectLastOpen);
  add("<C-6>", Tab.selectPrevious);
  add("<C-^>", Tab.selectPrevious);


  // History
  add("H", History.back);
  add("L", History.forward);
  add("<C-o>", History.back);
  add("<C-i>", History.forward);
  add("gh", History.start);
  add("gH", History.new_tab_start);


  // CmdLine
  add(":", CmdLine.start);


  // Hint
  add("f", Hint.start);
  add("F", Hint.new_tab_start);
  add("<M-f>", Hint.multi_mode_start);

  // Search
  add("/", Search.start);
  add("?", Search.backward);
  add("n", Search.next);
  add("N", Search.prev);
  add("*", Search.forwardCursor);
  add("#", Search.backwardCursor);
  add("<C-Enter>", Search.prev);
  add("<C-Enter>", Search.prev, true);
  add("<S-Enter>", Search.openCurrent);
  add("<S-Enter>", Search.openCurrent, true);
  add("<M-Enter>", Search.openCurrentNewTab);
  add("<M-Enter>", Search.openCurrentNewTab, true);


  // Buffer
  add("b", Buffer.gotoFirstMatch);
  add("B", Buffer.deleteMatch);


  add("gi", InsertMode.focusFirstTextInput);
  add("<C-z>", KeyEvent.disable);
  add("<C-v>", KeyEvent.passNextKey);
  add(".", KeyEvent.runLast);

  // Bookmark
  add("gb", Bookmark.start);
  add("gB", Bookmark.new_tab_start);

  // a-zA-Z
  for (i = 65; i <= 122; i++) {
    if (i > 90 && i < 97) continue;
    add("m" + String.fromCharCode(i), Marks.addLocalMark);
    add("'" + String.fromCharCode(i), Marks.gotoLocalMark);
  }

  add("M", Marks.addQuickMark)
  add("go", Marks.gotoQuickMark)
  add("gn", Marks.gotoQuickMarkNewTab)

  // InsertMode
  add("<C-i>", InsertMode.externalEditor, true);

  add("<C-a>", InsertMode.moveToFirstOrSelectAll, true);
  add("<C-e>", InsertMode.moveToEnd, true);

  add("<C-h>", InsertMode.deleteBackwardChar, true);
  add("<C-d>", InsertMode.deleteForwardChar, true);

  add("<M-w>", InsertMode.deleteBackwardWord, true);
  add("<M-d>", InsertMode.deleteForwardWord, true);

  add("<C-u>", InsertMode.deleteToBegin, true);
  add("<C-k>", InsertMode.deleteToEnd, true);

  add("<M-h>", InsertMode.MoveBackwardWord, true);
  add("<M-l>", InsertMode.MoveForwardWord, true);

  add("<M-j>", InsertMode.MoveBackwardChar, true);
  add("<M-k>", InsertMode.MoveForwardChar, true);
}


with(CmdLine) {
  add("help", "show help ", Help.show)
  add("bdelete", "buffer delete match", Buffer.deleteMatchHandle, true);
  add("mdelete", "mark delete match", Marks.deleteQuickMark, true);
  add("make-links", "transforms URLs into clickable links", Page.transformURLs);
  add("dld-links", "opens all links matching a URL (match begin;end)  e.g dld-links mp4 2;10", Page.openURLs, true);
}

// Initial
var initFunction = [Migration.exec, Zoom.init, KeyEvent.init, Frame.register, runCustomJS];
runIt();

$(document).ready(function() {
  loadCustomCSS();
  //  Help.show()
})
