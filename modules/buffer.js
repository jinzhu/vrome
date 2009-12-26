var Buffer = (function(){
  var bufferMode = false;

  function gotoFirstMatchHandle() {
    if(!bufferMode) return;
    Post({ action : 'Buffer.gotoFirstMatch', keyword : CmdLine.get().content });
    bufferMode = false;
  }

  function gotoFirstMatch() {
    var count = times(/*raw*/ true);

    if(count){
      Post({action: "Tab.goto",index : count - 1});
    }else{
      bufferMode = true;
      CmdLine.set({ title   : 'Buffer ', content : '' });
    }
  }

  return {
    gotoFirstMatch : gotoFirstMatch,
    gotoFirstMatchHandle : gotoFirstMatchHandle,
    }
})()
