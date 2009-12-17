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

  return {
    parent : parent,
    root   : root,
  }
})()
