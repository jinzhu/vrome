var Url = (function(){
  function start(/*Boolean*/ with_default,/*Boolean*/ new_tab) {
    var title   = new_tab ? 'TabOpen: ' : 'Open: ';
    var content = with_default ? location.href : '';
    Dialog.start(title, content, search, new_tab);
  }

  function search(keyword) {
    Post({action: "Tab.autoComplete", keyword: keyword, default_urls: fixUrl(keyword)});
  }

  function fixRelativePath(url) {
    // http://google.com
    if (/:\/\//.test(url)) {
      return url;
    // /admin
    } else if (/^\//.test(url)) {
      return document.location.origin + url;
    // ../users || ./products
    } else {
      if (url.match(/\/?\.\.$/)) { url += '/'; }
      var pathname = document.location.origin + document.location.pathname.replace(/\/+/g,'/');
      var paths = url.split('..');
      for (var i=0; i < paths.length; i++) {
        var path = paths[i];
        if (path.match(/^\//)) {
          pathname = pathname.replace(/\/[^\/]*\/?$/,'') + path;
        } else if (path.match(/^.\//)) {
          pathname = pathname.replace(/\/$/,'') + path.replace(/^.\//,'/');
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
      // looks like local URL, for example: localhost:3000
      } else if(/localhost(\z|\/|\:)/.test(url)) {
        result.push((url.match("://") ? "" : "http://") + url);
      // google vrome
      } else {
        url = escape(url)
        var searchengines = Option.get('searchengines');
        var searchengine  = url.replace(/^(\S+)\s.*$/,"$1"); // searchengine name: e.g: google

        // use the matched searchengine
        for (var j in searchengines) {
          if (j == searchengine) {
            result.push(searchengines[j].replace("{{keyword}}",url.replace(/^\S+\s+(.*)$/,"$1")));
            continue outermost;
          }
        }

        result.push(Option.default_search_url(url));
        continue outermost;
      }
    }
    return result;
  }

  function parent() {
		var pathname = location.pathname.split('/');
		var hostname = location.hostname.split('.');
		var count    = times();

		for (var i = 0; i < count; i++) {
			if (pathname.length <= 1) {
				if ( hostname.length > 2) { hostname.shift(); }
			} else {
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
      CmdBox.set({ title : "[Copied] Shortened URL: " + msg.url,timeout : 4000 });
    } else {
      CmdBox.set({ title : 'Shortening current URL',timeout : 4000 });
      Post({action: "shortUrl"});
    }
  }

  function openFromClipboard(/*Boolean*/ new_tab) {
    var selected_value = getSelected();
    if (selected_value !== "") {
      Post({action: "Tab.openUrl", url: fixUrl(selected_value), newtab: new_tab});
    } else {
      Post({action: "Tab.openFromClipboard", newtab: new_tab});
    }
  }

  return {
    parent      : parent    ,
    root        : root      ,
    increment   : increment ,
    decrement   : decrement ,
    shortUrl    : shortUrl  ,

    viewSource         : viewSource,
    viewSourceNewTab   : function(){ viewSource(true);  },

    open               : function(){ start(false,false); },
    tabopen            : function(){ start(false,true);  },
    openWithDefault    : function(){ start(true,false);  },
    tabopenWithDefault : function(){ start(true,true);   },

    openFromClipboard  : function() { openFromClipboard(false); },
    openFromClipboardNewTab  : function() { openFromClipboard(true); },

    fixRelativePath :  fixRelativePath
  };
})();
