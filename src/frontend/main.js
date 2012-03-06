var AcceptKey     = ["<Enter>","<C-j>","<C-m>"];
var CancelKey     = ["<Esc>", "<C-[>"];
var EscapeKey     = ["<Esc>", "<C-[>"];
var CtrlEscapeKey = ["<C-Esc>"];

function isCtrlAcceptKey(key) {
  if (key == '<C-Enter>') { return true; }
}

function isAcceptKey(key) {
  for (var i=0;i < AcceptKey.length; i++) {
    if (AcceptKey[i] == key) { return true; }
  }
}

function isEscapeKey(key) {
  for (var i=0;i < EscapeKey.length; i++) {
    if (EscapeKey[i] == key) { return true; }
  }
}

function isCtrlEscapeKey(key) {
  if (Option.get('enable_vrome_key') == key) {
    return true;
  }
  for (var i=0;i < CtrlEscapeKey.length; i++) {
    if (CtrlEscapeKey[i] == key) { return true; }
  }
}

function AcceptKeyFunction() {
  CmdLine.exec();
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
  Dialog.stop();
  CmdBox.remove();
}

function EscapeKeyFunction() {
  CancelKeyFunction();
}

function CtrlEscapeKeyFunction() {
  KeyEvent.enable();
  EscapeKeyFunction();
}

with (KeyEvent) {
  var arr = ["AcceptKey","CancelKey","EscapeKey", "CtrlEscapeKey"];
  for (var i=0; i < arr.length; i++) {
    var keys = window[arr[i]];
    for (var j=0; j < keys.length; j++) {
      add(keys[j], window[arr[i] + "Function"]       );
      add(keys[j], window[arr[i] + "Function"], true );
    }
  }

  add("<F1>", showHelp );

  // Zoom
  add("zi", Zoom["in"]      );
  add("zo", Zoom.out        );
  add("zm", Zoom.more       );
  add("zr", Zoom.reduce     );
  add("zz", Zoom.reset      );

  add("zI", Zoom.current_in     );
  add("zO", Zoom.current_out    );
  add("zM", Zoom.current_more   );
  add("zR", Zoom.current_reduce );
  add("zZ", Zoom.current_reset  );

  // Page
  add("]]", Page.next         );
  add("[[", Page.prev         );
  add("Y" , Page.copySelected );
  add("]f", Frame.next        );
  add("[f", Frame.prev        );


  // Url
  add("gu"    , Url.parent             );
  add("gU"    , Url.root               );
  add("gf"    , Url.viewSource         );
  add("gF"    , Url.viewSourceNewTab   );
  add("<C-a>" , Url.increment          );
  add("<C-x>" , Url.decrement          );
  add("o"     , Url.open               );
  add("O"     , Url.openWithDefault    );
  add("t"     , Url.tabopen            );
  add("T"     , Url.tabopenWithDefault );
  add("<C-y>" , Url.shortUrl           );
  add("p"     , Url.openFromClipboard  );
  add("P"     , Url.openFromClipboardNewTab  );

  add("<C-Enter>", Dialog.openCurrentNewTab );
  add("<C-Enter>", Dialog.openCurrentNewTab, true);


  // Scroll
  add("gg" , Scroll.top       );
  add("G"  , Scroll.bottom    );
  add("0"  , Scroll.first     );
  add("$"  , Scroll.last      );

  add("k"  , Scroll.up        );
  add("j"  , Scroll.down      );
  add("h"  , Scroll.left      );
  add("l"  , Scroll.right     );
  add("%"  , Scroll.toPercent );

  add("<C-f>" , Scroll.nextPage     );
  add("<C-b>" , Scroll.prevPage     );
  add("<C-d>" , Scroll.nextHalfPage );
  add("<C-u>" , Scroll.prevHalfPage );


  // Tab
  add("r"    , Tab.reload       );
  add("<C-r>", Tab.reloadWithoutCache);
  add("R"    , Tab.reloadAll    );

  add("dc"   , Tab.close        );
  add("dm"   , Buffer.deleteMatch  );
  add("do"   , Tab.closeOtherTabs );
  add("dl"   , Tab.closeLeftTabs  );
  add("dr"   , Tab.closeRightTabs );
  add("dp"   , Tab.closeUnPinnedTabs );
  add("dP"   , Tab.closePinnedTabs );


  add("D"    , Tab.closeAndFoucsLeft );
  add("<M-d>", Tab.closeAndFoucsLast );

  add("u"    , Tab.reopen       );

  add("<C-p>", Tab.prev         );
  add("<C-n>", Tab.next         );
  add("gt"   , Tab.next         );
  add("gT"   , Tab.prev         );

  add("gp"   , Tab.togglePin    );
  add("gd"   , Tab.duplicate    );
  add("gD"   , Tab.detach       );
  add("gI"   , Tab.openInIncognito);
  add("gm"   , Tab.merge        );
  add("gM"   , Tab.mergeAll     );

  add("y"     , Tab.copyUrl      );
  add("g0"    , Tab.first        );
  add("g^"    , Tab.first        );
  add("g$"    , Tab.last         );
  add("gl"    , Tab.selectLastOpen );
  add("<C-6>" , Tab.selectPrevious );
  add("<C-^>" , Tab.selectPrevious );


  // History
  add("H"    , History.back    );
  add("L"    , History.forward );
  add("<C-o>", History.back    );
  add("<C-i>", History.forward );
  add("gh"   , History.start );
  add("gH"   , History.new_tab_start );


  // CmdLine
  add(":"    , CmdLine.start   );


  // Hint
  add("f"     , Hint.start            );
  add("F"     , Hint.new_tab_start    );
  add("<M-f>" , Hint.multi_mode_start );


  // Search
  add("/"      , Search.start          );
  add("?"      , Search.backward       );
  add("n"      , Search.next           );
  add("N"      , Search.prev           );
  add("*"      , Search.forwardCursor  );
  add("#"      , Search.backwardCursor );
  add("<C-Enter>", Search.prev         );
  add("<C-Enter>", Search.prev,   true );
  add("<S-Enter>", Search.openCurrent  );
  add("<S-Enter>", Search.openCurrent, true );
  add("<M-Enter>", Search.openCurrentNewTab  );
  add("<M-Enter>", Search.openCurrentNewTab, true );


  // Buffer
  add("b" , Buffer.gotoFirstMatch );
  add("B" , Buffer.deleteMatch    );


  add("gi" , InsertMode.focusFirstTextInput );
  add("<C-z>" , KeyEvent.disable            );
  add("<C-v>" , KeyEvent.passNextKey        );
  add("."     , KeyEvent.runLast            );

	// Bookmark
  add("gb" , Bookmark.start );
  add("gB" , Bookmark.new_tab_start );

  // a-zA-Z
  for (var i = 65; i <= 122; i++) {
    if (i > 90 && i < 97) continue;
    add("M"  + String.fromCharCode(i), Marks.addQuickMark  );
    add("go" + String.fromCharCode(i), Marks.gotoQuickMark );
    add("gn" + String.fromCharCode(i), Marks.gotoQuickMarkNewTab );

    add("m" + String.fromCharCode(i), Marks.addLocalMark  );
    add("'" + String.fromCharCode(i), Marks.gotoLocalMark );
  }
  // 0-9
  for (var i = 0; i <= 9; i++) {
    add("M"  + i, Marks.addQuickMark  );
    add("go" + i, Marks.gotoQuickMark );
    add("gn" + i, Marks.gotoQuickMarkNewTab );
  }


  // InsertMode
  add("<C-i>", InsertMode.externalEditor        , true );

  add("<C-a>", InsertMode.moveToFirstOrSelectAll, true );
  add("<C-e>", InsertMode.moveToEnd             , true );

  add("<C-h>", InsertMode.deleteBackwardChar    , true );
  add("<C-d>", InsertMode.deleteForwardChar     , true );

  add("<M-w>", InsertMode.deleteBackwardWord    , true );
  add("<M-d>", InsertMode.deleteForwardWord     , true );

  add("<C-u>", InsertMode.deleteToBegin       , true );
  add("<C-k>", InsertMode.deleteToEnd         , true );

  add("<M-h>", InsertMode.MoveBackwardWord    , true );
  add("<M-l>", InsertMode.MoveForwardWord     , true );

  add("<M-j>", InsertMode.MoveBackwardChar    , true );
  add("<M-k>", InsertMode.MoveForwardChar     , true );
}


with (CmdLine) {
  add("help", showHelp );
  add("bdelete", Buffer.deleteMatchHandle );
}

// Initial
var initFunction = [ Zoom.init, KeyEvent.init, Frame.register];
runIt();
