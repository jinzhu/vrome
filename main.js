with(KeyEvent){
  add(['z','i'],Zoom['in']  );
  add(['z','o'],Zoom.out    );
  add(['z','m'],Zoom.more   );
  add(['z','r'],Zoom.reduce );
  add(['z','z'],Zoom.reset  );

  add([']',']'],Page.next   );
  add(['[','['],Page.prev   );

  add(['g','g'],Scroll.top  );
  add(['G'], Scroll.bottom  );
  add(['0'], Scroll.first   );
  add(['$'], Scroll.last    );
  add(['j'], Scroll.up      );
  add(['k'], Scroll.down    );
  add(['l'], Scroll.left    );
  add(['h'], Scroll.right   );

  add(['r'],   Tab.reload   );
  add(['R'],   Tab.reloadAll);
  add(['d'],   Tab.close    );
  add(['u'],   Tab.reopen   );
  add(['C-p'], Tab.prev     );
  add(['C-n'], Tab.next     );

  add(['H'], History.back   );
  add(['L'], History.forward);

  add(['f'], Hint.start   );

  add(['g','i'], InputMode.focusFirstTextInput);
  add(['C-z'],   disableVimlike);


  // InputMode
  add(['Esc'], InputMode.blurFocus             , true);
  add(['C-['], InputMode.blurFocus             , true);

  add(['C-a'], InputMode.moveToFirstOrSelectAll, true);
  add(['C-e'], InputMode.moveToEnd             , true);

  add(['C-d'], InputMode.deleteForwardChar     , true);
  add(['C-h'], InputMode.deleteBackwardChar    , true);

  add(['C-w'], InputMode.deleteBackwardWord    , true);

  // "C-U"  Delete backward from cursor
  // "C-K"  Delete to EOL
  // "M-d"  Delete word
  // "M-l"  Move forward word
  // "M-h"  Move backward word
  // "M-k"  Move forward char
  // "M-j"  Move backward char
}


function disableVimlike(){
  //TODO Add Notice
  localStorage._disableVimlike = true;
}

//function runLastSetting(){
//  if(document.body){
//    if(localStorage.disableVimlike){ passMode(); }
//    if(localStorage.vimlike_zoom){ setZoom(localStorage.vimlike_zoom); }
//  }else{
//    setTimeout(runLastSetting,100);
//  }
//}
//runLastSetting();
