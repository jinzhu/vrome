var Window = (function() {
	function moveTabToWindowWithIncognito(tab, incognito, callback) {
		chrome.windows.getAll({populate: true}, function(windows) {
			for (i=0; i < windows.length; i++) {
				var current_window = windows[i];
				if (current_window.type == 'normal' && current_window.incognito == incognito && current_window.id != tab.windowId) {
					chrome.tabs.create({windowId: current_window.id, url: tab.url, index: current_window.tabs.length});
					return callback(tab)
				}
			}

			chrome.windows.create({url: tab.url, incognito: incognito});
			return callback(tab)
		});
	}

	return {
		moveTabToWindowWithIncognito : moveTabToWindowWithIncognito
	}
})();
