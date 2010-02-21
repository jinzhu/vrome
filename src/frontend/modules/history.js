var History = (function() {
  return {
    back    : function(){ history.go(-1 * times()); },
    forward : function(){ history.go( 1 * times()); }
  };
})();
