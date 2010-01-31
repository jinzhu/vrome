var Debug = (function(){
  return function(str) {
    Post({action : 'debug' , message : str});
  };
})();
