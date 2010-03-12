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

  // need refactor
  function fixUrl(url) {
    var url = url.split(/, /);
    var urls = [];
    outermost : for (var i = 0; i< url.length; i++) {
      if ( /^\//.test(url[i]) && /^\S+\s*$/.test(url[i])) {
        urls[urls.length] = location.protocol + '//' + location.host + url[i];
      } else if( /\./.test(url[i]) && !/\s/.test(url[i])) {
        urls[urls.length] = (new RegExp('://','im').test(url[i]) ? "" : "http://") + url[i]
      }else{
        var searchengines = JSON.parse(Option.get('searchengines'));
        var searchengine  = url[i].replace(/^(\S+)\s.*$/,"$1");
        // use the matched searchengine
        for (var key in searchengines) {
          if (key == searchengine) {
            urls[urls.length] = searchengines[key].replace("{{keyword}}",url[i].replace(/^\S+\s+(.*)$/,"$1"));
            continue outermost;
          }
        }

        // use the first searchengine
        for (var key in searchengines) {
          urls[urls.length] = searchengines[key].replace("{{keyword}}",url[i]);
          continue outermost;
        }
      }
    }
    return urls;
  }

  function enter() {
    if(!urlMode) return;

    var urls = fixUrl(CmdBox.get().content);
    Debug('Url.enter - urls: ' + urls + ' newtab:' + newTab);

    Post({action: "Tab.openUrl", urls: urls, newtab: newTab});

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
		Post({action: "Tab.openUrl", url: url});
  }

  function root() {
    location.pathname = '/';
  }

  function increment(dirction) {
    var count = times() * (dirction || 1);

		if (document.location.href.match(/(.*?)(\d+)(\D*)$/)) {
			var pre = RegExp.$1 , number = RegExp.$2 , post = RegExp.$3;
			var newNumber = parseInt(number, 10) + count;
			var newNumberStr = String(newNumber > 0 ? newNumber : 0);
			if (number.match(/^0/)) { // add 0009<C-a> should become 0010
				while (newNumberStr.length < number.length)
				 newNumberStr = "0" + newNumberStr;
			}

			Post({ action: "Tab.openUrl", url: pre + newNumberStr + post});
		}
  }

  function decrement() {
		increment(-1);
  }

  function viewSource() {
		var url = Settings.get('background.currentUrl');
		url = url.replace(/^(view-source:)?/,/^view-source:/.test(url) ? '' : "view-source:");
    Post({action: "Tab.openUrl", urls: url, newtab: newTab});
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

  // API
  enter.private = true;

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
