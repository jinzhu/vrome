with(KeyEvent){
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
