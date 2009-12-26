var Buffer = (function(){
  var bufferGotoMode,bufferMatchMode;

  function gotoFirstMatchHandle() {
    if(!bufferGotoMode) return;
    Post({ action : 'Buffer.gotoFirstMatch', keyword : CmdLine.get().content });
    bufferGotoMode = false;
    CmdLine.remove();
  }

  function gotoFirstMatch() {
    var count = times(/*raw*/ true);

    if(count){
      Post({action: "Tab.goto",index : count - 1});
    }else{
      bufferGotoMode = true;
      CmdLine.set({ title   : 'Buffer ', content : '' });
    }
  }

  function deleteMatchHandle() {
    if(!bufferMatchMode) return;
    Post({ action : 'Buffer.deleteMatch', keyword : CmdLine.get().content });
    bufferMatchMode = false;
    CmdLine.remove();
  }

  function deleteMatch(){
    bufferMatchMode = true;
    CmdLine.set({ title   : 'Delete Buffer ', content : '' });
  }

  return {
    gotoFirstMatch       : gotoFirstMatch       ,
    gotoFirstMatchHandle : gotoFirstMatchHandle ,
    deleteMatch          : deleteMatch          ,
    deleteMatchHandle    : deleteMatchHandle    ,
  }
})()
