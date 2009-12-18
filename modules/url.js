var Url = (function(){
  var urlMode;
  var newTab;

  //TODO auto complete?
  function open(/*Boolean*/ withDefault,/*Boolean*/ newtab) {
    urlMode = true;
    newTab  = newtab;
    CmdLine.set({
      title   : newTab ? 'TabOpen: ' : 'Open: ',
      content : withDefault ? location.href : ''
    });
  }

  function fixUrl(url) {
    if(/\./.test(url) && !/\s/.test(url)){
      return (new RegExp('://','im').test(url) ? "" : "http://") + url
    }else{
      return "http://www.google.com/search?q=" + url;
    }
  }

  function enter() {
    if(urlMode){
      var url = fixUrl(CmdLine.get().content);

      Debug('Run UrlOpen Mode, Url: ' + url + ' NewTab:' + newTab);

      var port = chrome.extension.connect();
      port.postMessage({action: "open_url", url: url, newtab: newTab});

      urlMode = false;
      CmdLine.remove();
    }
  }

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
    enter     : enter,

    open      : function(){ open(false,false); },
    tabopen   : function(){ open(false,true); },
    open_with_default    : function(){ open(true,false); },
    tabopen_with_default : function(){ open(true,true); },
  }
})()
