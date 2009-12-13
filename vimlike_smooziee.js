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
}

////////////////////////////////////////////////////
//// History
////////////////////////////////////////////////////
//function historyBack(){
//  history.back();
//}
//
//function historyForward(){
//  history.forward();
//}
//
////////////////////////////////////////////////////
//// gMode
////////////////////////////////////////////////////
//function gMode(){
//  keyListener({add : gHandler,remove : initKeyBind});
//}
//
//function gHandler(e){
//  addKeyBind( 'g', 'scrollToTop()', e );
//  addKeyBind( 'i', 'focusFirstTextInput()', e );
//  var pressedKey = get_key(e);
//  if (pressedKey != 'g' && pressedKey != 'i'){
//    keyListener({add : initKeyBind,remove : gHandler});
//  }
//}
//
//////////////////////
//
//function enableVimlike(){
//  removeNotice();
//  keyListener({add : initKeyBind });
//  localStorage.removeItem('disableVimlike');
//}
//
//function passMode(){
//    notice({title : ' -- PASS THROUGH -- '});
//    keyListener({add : passModeHandle,remove : initKeyBind});
//    localStorage.disableVimlike = true;
//}
//
//function passModeHandle(e){
//  addKeyBind( 'Esc', 'enableVimlike()', e );
//}
//
//
//function runLastSetting(){
//  if(document.body){
//    if(localStorage.disableVimlike){ passMode(); }
//    if(localStorage.vimlike_zoom){ setZoom(localStorage.vimlike_zoom); }
//  }else{
//    setTimeout(runLastSetting,100);
//  }
//}
//
//enableVimlike();
//runLastSetting();
