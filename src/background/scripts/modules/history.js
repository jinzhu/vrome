var History = (function() {

	function search(msg) {
    var tab     = arguments[arguments.length-1],index;
    var keyword = msg.keyword;

      chrome.history.search({text: keyword, startTime: 0}, function(historys) {
      Post(tab, { action: "Dialog.draw", urls: historys, keyword: keyword });
    })
	}

  return { search : search }
})();
