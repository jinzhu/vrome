Window = (->
  moveTabToWindowWithIncognito = (tab, incognito, create_mode, callback) ->
    chrome.windows.getAll
      populate: true
    , (windows) ->
      i = 0

      while i < windows.length
        current_window = windows[i]
        if current_window.type is "normal" and current_window.incognito is incognito and current_window.id isnt tab.windowId
          if create_mode
            chrome.tabs.create
              windowId: current_window.id
              url: tab.url
              index: current_window.tabs.length

          else
            chrome.tabs.move tab.id,
              windowId: current_window.id
              index: current_window.tabs.length

          return ((if callback then callback(tab) else null))
        i++
      if create_mode
        chrome.windows.create
          url: tab.url
          incognito: incognito

        callback tab

  moveTabToWindowWithIncognito: moveTabToWindowWithIncognito
)()
