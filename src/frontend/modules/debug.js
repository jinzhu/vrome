var Debug = (function() {
  return function(str) {
    // console.log(str);
    Post({
      action: 'debug',
      message: str
    });
  };
})();

var D = (function() {
  return {
    log: function(msg) {
      console.log(msg.m);
    }
  }
})();
