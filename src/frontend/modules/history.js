var History = (function() {
  return {
    back    : function(){ history.go(-1 * times()); },
    forward : function(){ history.go( 1 * times()); }
  };
})();

for(var i in History) {
	History[i].normalMode = true;
}
