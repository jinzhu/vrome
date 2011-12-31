var Window = (function() {
	function moveTabToWindowWithIncognito(tab, incognito, create_mode, callback) {
		chrome.windows.getAll({populate: true}, function(windows) {
			for (var i=0; i < windows.length; i++) {
				var current_window = windows[i];
				if (current_window.type == 'normal' && current_window.incognito == incognito && current_window.id != tab.windowId) {
					if (create_mode) {
						chrome.tabs.create({ windowId: current_window.id, url: tab.url, index: current_window.tabs.length});
					} else {
						chrome.tabs.move(tab.id, { windowId: current_window.id, index: current_window.tabs.length});
					}
					return (callback ? callback(tab) : null);
				}
			}

			if (create_mode) {
				chrome.windows.create({url: tab.url, incognito: incognito});
				return callback(tab);
			}
		});
	}

	return {
		moveTabToWindowWithIncognito : moveTabToWindowWithIncognito
	};
})();
