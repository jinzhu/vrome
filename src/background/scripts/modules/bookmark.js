var Bookmark = (function() {

	function search(msg) {
    var tab     = arguments[arguments.length-1],index;
    var keyword = msg.keyword;

    chrome.bookmarks.search(keyword, function(bookmarks) {
      Post(tab, { action: "Dialog.draw", urls: bookmarks, keyword: keyword });
    })
	}

	return { search : search }
})();
