var Debug = (function(){
  return function(str) {
    // console.log(str);
    Post({action : 'debug' , message : str});
  };
})();
