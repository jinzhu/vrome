var times = function(/*Boolean*/ read) {
  var time = KeyEvent.times(read) || 1;
  Debug('KeyEvent.times:' + time);
  return time;
};

var Post = function(msg){
    var port = chrome.extension.connect();
    port.postMessage(msg);
}

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


  // Url
  add(['g','u'], Url.parent  );
  add(['g','U'], Url.root    );
  add(['C-a'], Url.increment );
  add(['C-x'], Url.decrement );
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

  add(['y']  , Tab.yankUrl   );
  add(['Y']  , Tab.copyUrl   );
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

  add(['g','i'], InputMode.focusFirstTextInput );
  add(['C-z'], KeyEvent.disable     );
  add(['C-v'], KeyEvent.passNextKey );
  add(['.'], KeyEvent.runLast);


  // InputMode
  add(['Esc'], InputMode.blurFocus             , true );
  add(['C-['], InputMode.blurFocus             , true );

  add(['C-a'], InputMode.moveToFirstOrSelectAll, true );
  add(['C-e'], InputMode.moveToEnd             , true );

  add(['C-d'], InputMode.deleteForwardChar     , true );
  add(['C-h'], InputMode.deleteBackwardChar    , true );

  add(['C-w'], InputMode.deleteBackwardWord    , true );

  // "C-U"  Delete backward from cursor
  // "C-K"  Delete to EOL
  // "M-d"  Delete word
  // "M-l"  Move forward word
  // "M-h"  Move backward word
  // "M-k"  Move forward char
  // "M-j"  Move backward char
}

function clickElement(element,opt) {
  //event.initMouseEvent(type, canBubble, cancelable, view,
  //                     detail, screenX, screenY, clientX, clientY,
  //                     ctrlKey, altKey, shiftKey, metaKey,
  //                     button, relatedTarget);
  // https://developer.mozilla.org/en/DOM/event.initMouseEvent
  opt = opt || {};

  var event = document.createEvent("MouseEvents");
  event.initMouseEvent("click", true, true, window,
      0, 0, 0, 0, 0,
      !!opt.ctrl, !!opt.alt, !!opt.shift, !!opt.meta,
      0, null);
  element.dispatchEvent(event);
}

// Initial
var initFunction = [ Zoom.init, KeyEvent.init];

function runIt(func,args){
  initFunction.push([func,args]);

  if(document.body){
    for(var i in initFunction){
      func = initFunction.shift();
      Debug("RunIt:" + func);
      if(func instanceof Function){
        func.call();
      }else{
        if(func[0] instanceof Function) func[0].apply('',func[1]);
      }
    }
  }else{
    setTimeout(runIt,50);
  }
}

runIt();

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    var tab = port.tab;
    switch(msg.action){
    case "changeStatus":
      Debug("changeStatus - listener:" + msg.disable);
      runIt(KeyEvent.changeStatus, [msg.disable]);
      KeyEvent.setLast(msg.currentKeys, msg.times);
      break;
    }
  });
})
