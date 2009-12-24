with(KeyEvent) {
  // Zoom
  add(['z', 'i'], Zoom['in']  );
  add(['z', 'o'], Zoom.out    );
  add(['z', 'm'], Zoom.more   );
  add(['z', 'r'], Zoom.reduce );
  add(['z', 'z'], Zoom.reset  );

  add(['z', 'I'], Zoom.cur_in    );
  add(['z', 'O'], Zoom.cur_out   );
  add(['z', 'M'], Zoom.cur_more  );
  add(['z', 'R'], Zoom.cur_reduce);
  add(['z', 'Z'], Zoom.cur_reset );


  // Page
  add([']',']'], Page.next );
  add(['[','['], Page.prev );
  add(['Y']    , Page.copySelected );


  // Url
  add(['g','u'], Url.parent  );
  add(['g','U'], Url.root    );
  add(['g','f'], Url.viewSource );
  add(['C-a'], Url.increment    );
  add(['C-x'], Url.decrement    );
  add(['o'], Url.open                 );
  add(['O'], Url.open_with_default    );
  add(['t'], Url.tabopen              );
  add(['T'], Url.tabopen_with_default );
  add(['Enter'], Url.enter,true       );


  // Scroll
  add(['g','g'], Scroll.top      );
  add(['G']    , Scroll.bottom   );
  add(['0']    , Scroll.first    );
  add(['$']    , Scroll.last     );

  add(['k']    , Scroll.up       );
  add(['j']    , Scroll.down     );
  add(['h']    , Scroll.left     );
  add(['l']    , Scroll.right    );
  add(['%']    , Scroll.toPercent);

  add(['C-f']  , Scroll.nextPage );
  add(['C-b']  , Scroll.prevPage );
  add(['C-d']  , Scroll.nextHalfPage );
  add(['C-u']  , Scroll.prevHalfPage );


  // Tab
  add(['r']  , Tab.reload    );
  add(['R']  , Tab.reloadAll );
  add(['d']  , Tab.close     );
  add(['u']  , Tab.reopen    );
  add(['C-p'], Tab.prev      );
  add(['C-n'], Tab.next      );
  add(['g','t'],Tab.next     );
  add(['g','T'],Tab.prev     );

  add(['y']  , Tab.copyUrl   );
  add(['g','0'], Tab.first   );
  add(['g','^'], Tab.first   );
  add(['g','$'], Tab.last    );
  add(['C-6'], Tab.lastSelected );
  add(['C-^'], Tab.lastSelected );


  // History
  add(['H'],   History.back    );
  add(['L'],   History.forward );
  add(['C-o'], History.back    );
  add(['C-i'], History.forward );


  // CmdLine
  add(['Esc'], CmdLine.remove     );
  add(['Esc'], CmdLine.remove,true);

  // Hint
  add(['f']  , Hint.start         );
  add(['F']  , Hint.new_tab_start );
  add(['Esc'], Hint.remove        );
  add(['Esc'], Hint.remove , true );


  // Search
  add(['/']      , Search.start          );
  add(['?']      , Search.backward       );
  add(['n']      , Search.next           );
  add(['Enter']  , Search.next    , true );
  add(['N']      , Search.prev           );
  add(['S-Enter'], Search.prev    , true );
  add(['Esc']    , Search.stop           );
  add(['Esc']    , Search.stop    , true );
  add(['*']      , Search.forwardCursor  );
  add(['#']      , Search.backwardCursor );

  add(['g','i'], InsertMode.focusFirstTextInput );
  add(['C-z'], KeyEvent.disable     );
  add(['C-v'], KeyEvent.passNextKey );
  add(['.'], KeyEvent.runLast);


  // InsertMode
  add(['Esc'], InsertMode.blurFocus             , true );
  add(['C-['], InsertMode.blurFocus             , true );

  add(['C-a'], InsertMode.moveToFirstOrSelectAll, true );
  add(['C-e'], InsertMode.moveToEnd             , true );

  add(['C-h'], InsertMode.deleteBackwardChar    , true );
  add(['C-d'], InsertMode.deleteForwardChar     , true );

  add(['C-w'], InsertMode.deleteBackwardWord    , true );
  add(['M-d'], InsertMode.deleteForwardWord     , true );

  add(['C-u'], InsertMode.deleteToBegin    , true );
  add(['C-k'], InsertMode.deleteToEnd      , true );

  add(['M-h'], InsertMode.MoveBackwardWord    , true );
  add(['M-l'], InsertMode.MoveForwardWord     , true );

  add(['M-j'], InsertMode.MoveBackwardChar    , true );
  add(['M-k'], InsertMode.MoveForwardChar     , true );
}

// Initial
var initFunction = [ Zoom.init, KeyEvent.init];
runIt();

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    var tab = port.tab;
    switch(msg.action){
    case "changeStatus":
      Debug("changeStatus - disable:" + msg.disable + " force:" + msg.force);
      runIt(KeyEvent.changeStatus, [msg.disable,msg.force]);
      if(msg.currentKeys) KeyEvent.setLast(msg.currentKeys, msg.times);
      break;
    }
  });
})
