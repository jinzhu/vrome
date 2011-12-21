var Url = (function(){
  var urlMode, newTab;

  function open(/*Boolean*/ withDefault,/*Boolean*/ newtab) {
    urlMode = true;
    newTab  = newtab;

    CmdBox.set({
      title   : newTab ? 'TabOpen: ' : 'Open: ',
      content : withDefault ? location.href : ''
    });
  }

  function fixRelativePath(url) {
    // Not relative path
    if (/:\/\//.test(url)) {
      return url;
    } else if (/^\//.test(url)) {
      return document.location.origin + url;
    } else {
      if (url == '..') { url = '../'; }
      var pathname = document.location.origin + document.location.pathname;
      var paths = url.split('..');
      for (var i=0; i < paths.length; i++) {
        var path = paths[i];
        if (path.match(/^\//)) {
          pathname = pathname.replace(/\/[^\/]*\/?$/,'') + path;
        } else if (path.match(/^.\//)) {
          pathname = pathname + path.replace(/^.\//,'/');
        }
      }
      return pathname;
    }
  }

  function fixUrl(url_str) {
    var urls   = url_str.split(/, /);
    var result = [];

    outermost : for (var i = 0; i< urls.length; i++) {
      url = urls[i].trim();
      // relative path e.g: .. || ./configure
      // absolute path e.g: /jinzhu
      if ( (/^\//.test(url) || /^\.\.?\/?/.test(url)) && /^\S+\s*$/.test(url)) {
        result.push(fixRelativePath(url));
      // looks like url, for example: google.com
      } else if( /\./.test(url) && !/\s/.test(url)) {
        result.push((url.match("://") ? "" : "http://") + url);
      // google vrome
      }else{
        var searchengines = JSON.parse(Option.get('searchengines')); // object
        var searchengine  = url.replace(/^(\S+)\s.*$/,"$1"); // google

        // use the matched searchengine
        for (var j in searchengines) {
          if (j == searchengine) {
            result.push(searchengines[j].replace("{{keyword}}",url.replace(/^\S+\s+(.*)$/,"$1")));
            continue outermost;
          }
        }

        // use the first searchengine
        for (var j in searchengines) {
          result.push(searchengines[j].replace("{{keyword}}", url));
          continue outermost;
        }
      }
    }
    return result;
  }

  function enter() {
    if(!urlMode) { return; }

    var urls = fixUrl(CmdBox.get().content);
    Post({action: "Tab.openUrl", urls: urls, newtab: newTab});

    urlMode = false;
    CmdBox.remove();
  }

  function parent() {
		var pathname = location.pathname.split('/');
		var hostname = location.hostname.split('.');
		var count;
    count = times();

		for(var i = 0; i < count; i++){
			if(pathname.length <= 1){
				if ( hostname.length > 2) { hostname.shift(); }
			}else{
				pathname.pop();
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
				while (newNumberStr.length < number.length) {
				 newNumberStr = "0" + newNumberStr;
        }
			}

			Post({ action: "Tab.openUrl", url: pre + newNumberStr + post});
		}
  }

  function decrement() {
		increment(-1);
  }

  function viewSource(newTab) {
		var url = Settings.get('background.currentUrl');
		url = url.replace(/^(view-source:)?/, /^view-source:/.test(url) ? '' : "view-source:");
    Post({action: "Tab.openUrl", urls: url, newtab: newTab});
  }

  function shortUrl(msg) {
    if (msg && msg.url) {
      Clipboard.copy(msg.url);
      CmdBox.set({ title : "[Copied] Shorten URL IS: " + msg.url,timeout : 4000 });
    }else{
      CmdBox.set({ title : 'Shorten the current URL.',timeout : 4000 });
      Post({action: "shortUrl"});
    }
  }

  function openFromClipboard(/*Boolean*/ newtab) {
    Post({action: "Tab.openFromClipboard", newtab: newtab});
  }

  function close() {
    urlMode = false;
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

    openFromClipboard  : function() { openFromClipboard(false); },
    openFromClipboardNewTab  : function() { openFromClipboard(true); },

    fixRelativePath :  fixRelativePath,
    close : close
  };
})();
