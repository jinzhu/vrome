var Url = (function(){

  function parent() {
    if (location.pathname != '/') {
      /(.*)\/[\/]*?/.test(location.pathname);
      document.location.pathname = RegExp.$1;
    } else {
      var segments = location.hostname.split('.');
      if (segments.length > 2) {
        segments.shift();
        document.location = location.protocol + '//' + segments.join('.');
      }
    }
  }

  function root() {
    location.pathname = '/';
  }

  function increment() {
   if(/^(.*?)(\d+)([^\d]*)$/.test(document.location.href))
      document.location.href = RegExp.$1 + (Number(RegExp.$2) + 1) + RegExp.$3;
  }

  function decrement() {
   if(/^(.*?)(\d+)([^\d]*)$/.test(document.location.href))
      document.location.href = RegExp.$1 + (Number(RegExp.$2) - 1) + RegExp.$3;
  }

  return {
    parent : parent,
    root   : root,
    increment : increment,
    decrement : decrement,
  }
})()
