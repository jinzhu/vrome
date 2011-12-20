var Frame = (function() {
  var frameId;

  function register() {
    frameId = Math.floor(Math.random()*999999999);
    var area = innerWidth * innerHeight;

    if (!/doubleclick\.|qzone\.qq\.com|plusone\.google\.com/.test(window.location.href) && area > 0) {
      Post({
        action: "Frame.register",
        frame: { id: frameId, area: innerWidth * innerHeight }
      });
    }
  }

  function select(msg) {
    if(frameId == msg.frameId) {
      window.focus();
      var borderWas = document.body.style.border;
      document.body.scrollIntoViewIfNeeded();

      document.body.style.border = '5px solid yellow';
      setTimeout(function(){
        document.body.style.border = borderWas;
      }, 200);

      CmdBox.set({ title : "Switched to Frame: " + document.location.href,timeout : 2000 });
    }
  }

  function next() {
    Post({ action: "Frame.next", frameId: frameId, count: times() });
  }

  return {
    register : register,
    select : select,
    next : next
  };
})();
