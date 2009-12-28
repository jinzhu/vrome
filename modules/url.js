var Url = (function(){
  var urlMode;
  var newTab;

  //TODO auto complete?
  function open(/*Boolean*/ withDefault,/*Boolean*/ newtab) {
    urlMode = true;
    newTab  = newtab;
    CmdBox.set({
      title   : newTab ? 'TabOpen: ' : 'Open: ',
      content : withDefault ? location.href : ''
    });
  }

  function fixUrl(url) {
    var url = url.split(/, /);
    var urls = [];
    for(var i = 0; i< url.length; i++){
      if(/\./.test(url[i]) && !/\s/.test(url[i])){
        urls[urls.length] = (new RegExp('://','im').test(url[i]) ? "" : "http://") + url[i]
      }else{
        urls[urls.length] = "http://www.google.com/search?q=" + url[i];
      }
    }
    return urls;
  }

  function enter() {
    if(!urlMode) return;

    var urls = fixUrl(CmdBox.get().content);
    Debug('Url.enter - urls: ' + urls + ' newtab:' + newTab);

    Post({action: "open_url", urls: urls, newtab: newTab});

    urlMode = false;
    CmdBox.remove();
  }

  function parent() {
		var pathname = location.pathname.split('/');
		var hostname = location.hostname.split('.');
		var count 	 = times();

		for(var i = 0; i < count; i++){
			if(pathname.length <= 1){
				if ( hostname.length > 2) { hostname.shift(); }
			}else{
				if (!pathname.pop()) !pathname.pop();
			}
		}

		hostname = hostname.join('.');
		pathname = pathname.join('/');

		var url = location.protocol + '//' + hostname + (location.port ? (':' + location.port) : '') + pathname;
		Post({action: "open_url", url: url});
  }

  function root() {
    location.pathname = '/';
  }

  function increment() {
   var count 	 = times();
   if(/^(.*?)(\d+)([^\d]*)$/.test(document.location.href))
			Post({action: "open_url", url: RegExp.$1 + (Number(RegExp.$2) + count) + RegExp.$3});
  }

  function decrement() {
   var count 	 = times();
   if(/^(.*?)(\d+)([^\d]*)$/.test(document.location.href))
			Post({action: "open_url", url: RegExp.$1 + (Number(RegExp.$2) - count) + RegExp.$3});
  }

  function viewSource() {
		var url = Settings.get('background.currentUrl');
		url = url.replace(/^(view-source:)?/,/^view-source:/.test(url) ? '' : "view-source:");
    Post({action: "open_url", urls: url, newtab: newTab});
  }

  function shortUrl(msg) {
    if (msg && msg.url) {
      Clipboard.copy(msg.url);
      CmdBox.set({ title : "It's copied,the shorten URL: " + msg.url,timeout : 4000 });
    }else{
      CmdBox.set({ title : 'shorten the current URL.',timeout : 4000 });
      Post({action: "shortUrl"})
    }
  }

  return {
    parent    : parent    ,
    root      : root      ,
    increment : increment ,
    decrement : decrement ,
    enter     : enter     ,
    shortUrl  : shortUrl  ,

    viewSource         : viewSource,
    viewSourceNewTab   : function(){ viewSource(true);  },

    open               : function(){ open(false,false); },
    tabopen            : function(){ open(false,true);  },
    openWithDefault    : function(){ open(true,false);  },
    tabopenWithDefault : function(){ open(true,true);   },
  }
})()
