var Frame = (function() {
  var frameId;

  function register() {
    frameId = Math.floor(Math.random()*999999999);
    if (window.frameElement && window.frameElement.localName != "iframe") {
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

      document.body.style.border = '5px solid yellow';
      setTimeout(function(){
        document.body.style.border = borderWas;
      }, 200);
    }
  }

  function next() {
    Post({
      action: "Frame.next",
      frameId: frameId,
      count: times()
    });
  }


  return {
    register : register,
    select : select,
    next : next
  };
})();
