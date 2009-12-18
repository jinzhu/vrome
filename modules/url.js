var Url = (function(){

  function parent() {
    if(location.pathname == '/'){
      var segments = location.hostname.split('.');
      if (segments.length > 2) {
        segments.shift();
        var hostname = segments.join('.');
      }
    }else{
      var segments = location.pathname.split('/');
      if( !segments.splice(segments.length - 1, 1)[0] ) segments.splice(segments.length - 1, 1);
      var pathname = segments.join('/');
    }

    location.href = location.protocol + '//' + (hostname || location.hostname) + (location.port ? (':' + location.port) : '') + (pathname || location.pathname);
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
    parent    : parent,
    root      : root,
    increment : increment,
    decrement : decrement,
  }
})()
