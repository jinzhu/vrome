class Window
  @create: () ->
    chrome.windows.create()

  @moveTabToWindowWithIncognito: (tab, incognito, create_mode, callback) ->
    chrome.windows.getAll {populate: true}, (windows) ->
      for window in windows
        if (window.type is "normal") and (window.incognito is incognito) and (window.id isnt tab.windowId)
          if create_mode
            chrome.tabs.create windowId: window.id, url: tab.url, index: -1
          else
            chrome.tabs.move tab.id, windowId: window.id, index: -1

          callback(tab) if callback
          return true

      # not returned
      if create_mode
        chrome.windows.create url: tab.url, incognito: incognito
        callback tab


root = exports ? window
root.Window = Window
