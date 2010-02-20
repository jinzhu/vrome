with (KeyEvent) {
  // Zoom
  add('zi', Zoom['in']  );
  add('zo', Zoom.out    );
  add('zm', Zoom.more   );
  add('zr', Zoom.reduce );
  add('zz', Zoom.reset  );

  add('zI', Zoom.cur_in     );
  add('zO', Zoom.cur_out    );
  add('zM', Zoom.cur_more   );
  add('zR', Zoom.cur_reduce );
  add('zZ', Zoom.cur_reset  );


  // Page
  add(']]', Page.next );
  add('[[', Page.prev );
  add('Y' , Page.copySelected );


  // Url
  add('gu', Url.parent             );
  add('gU', Url.root               );
  add('gf', Url.viewSource         );
  add('gF', Url.viewSourceNewTab   );
  add('<C-a>'  , Url.increment          );
  add('<C-x>'  , Url.decrement          );
  add('o'      , Url.open               );
  add('O'      , Url.openWithDefault    );
  add('t'      , Url.tabopen            );
  add('T'      , Url.tabopenWithDefault );
  add('<C-y>'  , Url.shortUrl           );
  add('<Enter>', Url.enter,true         );


  // Scroll
  add('gg', Scroll.top          );
  add('G' , Scroll.bottom       );
  add('0' , Scroll.first        );
  add('$' , Scroll.last         );

  add('k' , Scroll.up           );
  add('j' , Scroll.down         );
  add('h' , Scroll.left         );
  add('l' , Scroll.right        );
  add('%' , Scroll.toPercent    );

  add('<C-f>'  , Scroll.nextPage     );
  add('<C-b>'  , Scroll.prevPage     );
  add('<C-d>'  , Scroll.nextHalfPage );
  add('<C-u>'  , Scroll.prevHalfPage );


  // Tab
  add('r'    , Tab.reload       );
  add('R'    , Tab.reloadAll    );
  add('d'    , Tab.close        );
  add('D'    , Tab.closeAndFoucsLeft );
  add('<M-d>', Tab.closeAndFoucsLast );
  add('u'    , Tab.reopen       );
  add('<C-p>', Tab.prev         );
  add('<C-n>', Tab.next         );
  add('gt', Tab.next         );
  add('gT', Tab.prev         );

  add('y'    , Tab.copyUrl      );
  add('g0', Tab.first        );
  add('g^', Tab.first        );
  add('g$', Tab.last         );
  add('<C-6>'  , Tab.lastSelected );
  add('<C-^>'  , Tab.lastSelected );


  // History
  add('H'  , History.back    );
  add('L'  , History.forward );
  add('<C-o>', History.back    );
  add('<C-i>', History.forward );


  // CmdBox
  add('<Esc>', CmdBox.remove     );
  add('<Esc>', CmdBox.remove,true);


  // CmdLine
  add(':'    , CmdLine.start );
  add('<Enter>', CmdLine.exec , true );


  // Hint
  add('f'  , Hint.start         );
  add('F'  , Hint.new_tab_start );
  add('<Esc>', Hint.remove        );
  add('<Esc>', Hint.remove , true );


  // Search
  add('/'      , Search.start          );
  add('?'      , Search.backward       );
  add('n'      , Search.next           );
  add('N'      , Search.prev           );
  add('*'      , Search.forwardCursor  );
  add('#'      , Search.backwardCursor );
  add('<Enter>'  , Search.next    , true );
  add('<S-Enter>', Search.prev    , true );
  add('<Esc>'    , Search.stop           );
  add('<Esc>'    , Search.stop    , true );


  // Buffer
  add('<Enter>', Buffer.gotoFirstMatchHandle,true );
  add('<Enter>', Buffer.deleteMatchHandle,true );
  add('b'    , Buffer.gotoFirstMatch );
  add('B'    , Buffer.deleteMatch );


  add('gi', InsertMode.focusFirstTextInput );
  add('<C-z>'  , KeyEvent.disable               );
  add('<C-v>'  , KeyEvent.passNextKey           );
  add('.'    , KeyEvent.runLast               );


  // InsertMode
  add('<C-i>', InsertMode.externalEditor        , true );

  add('<Esc>', InsertMode.blurFocus             , true );
  add('<C-[>', InsertMode.blurFocus             , true );

  add('<C-a>', InsertMode.moveToFirstOrSelectAll, true );
  add('<C-e>', InsertMode.moveToEnd             , true );

  add('<C-h>', InsertMode.deleteBackwardChar    , true );
  add('<C-d>', InsertMode.deleteForwardChar     , true );

  add('<C-w>', InsertMode.deleteBackwardWord    , true );
  add('<M-d>', InsertMode.deleteForwardWord     , true );

  add('<C-u>', InsertMode.deleteToBegin    , true );
  add('<C-k>', InsertMode.deleteToEnd      , true );

  add('<M-h>', InsertMode.MoveBackwardWord    , true );
  add('<M-l>', InsertMode.MoveForwardWord     , true );

  add('<M-j>', InsertMode.MoveBackwardChar    , true );
  add('<M-k>', InsertMode.MoveForwardChar     , true );
}


with(CmdLine) {
  add('bdelete', Buffer.deleteMatchHandle );
}

// Initial
var initFunction = [ Zoom.init, KeyEvent.init];
runIt();
