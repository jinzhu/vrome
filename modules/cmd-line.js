var CmdLine = (function(){

  function start() {
    CmdBox.set({ content : ''});
  }

  function exec() {
  alert('s');
  }

  return { start : start, exec : exec };
})()
