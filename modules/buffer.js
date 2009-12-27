var Buffer = (function(){
  var bufferGotoMode,bufferMatchMode;

  function gotoFirstMatchHandle() {
    if(!bufferGotoMode) return;
    Post({ action : 'Buffer.gotoFirstMatch', keyword : CmdBox.get().content });
    bufferGotoMode = false;
    CmdBox.remove();
  }

  function gotoFirstMatch() {
    var count = times(/*raw*/ true);

    if(count){
      Post({action: "Tab.goto",index : count - 1});
    }else{
      bufferGotoMode = true;
      CmdBox.set({ title   : 'Buffer ', content : '' });
    }
  }

  function deleteMatchHandle() {
    if(!bufferMatchMode) return;
    Post({ action : 'Buffer.deleteMatch', keyword : CmdBox.get().content });
    bufferMatchMode = false;
    CmdBox.remove();
  }

  function deleteMatch(){
    bufferMatchMode = true;
    CmdBox.set({ title   : 'Delete Buffer ', content : '' });
  }

  return {
    gotoFirstMatch       : gotoFirstMatch       ,
    gotoFirstMatchHandle : gotoFirstMatchHandle ,
    deleteMatch          : deleteMatch          ,
    deleteMatchHandle    : deleteMatchHandle    ,
  }
})()
