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

      var code = "CmdBox.set({ title : 'Switched Frame To:" + document.location.href + "',timeout : 4000});";
      Post({ action: "runScript", code: code});
    }
  }

  function next() {
    Post({ action: "Frame.next", frameId: frameId, count: times() });
  }

  function prev() {
    Post({ action: "Frame.next", frameId: frameId, count: 0 - times() });
  }

  return {
    register : register,
    select : select,
    next : next,
    prev : prev
  };
})();
