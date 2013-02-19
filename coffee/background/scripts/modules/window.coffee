class Window
  @create: () ->
    chrome.windows.create()

  @close: () ->
    tab = getTab(arguments)
    chrome.windows.remove(tab.windowId)

  @close_all: () ->
    chrome.windows.getAll (windows) ->
      chrome.windows.remove(window.id) for window in windows

  @capture: () ->
    tab = getTab(arguments)
    chrome.tabs.captureVisibleTab tab.windowId, {format: 'png'}, (dataUrl) ->
      Post tab, {action: "Window.capture", url: dataUrl}

  @save_page: (msg) ->
    tab = getTab(arguments)
    chrome.pageCapture.saveAsMHTML tabId: tab.id, (mhtml) ->
      filename = (msg.filename ? tab.title).replace(/(.mhtml)?$/, '.mhtml')
      saveAs(mhtml, filename)
      Post tab, {action: "Window.saveas", data: mhtml, filename: filename}


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
