class Window
  @create: () ->
    chrome.windows.create()

  @close: () ->
    tab = getTab(arguments)
    chrome.windows.remove(tab.windowId)

  @closeAll: () ->
    chrome.windows.getAll (windows) ->
      chrome.windows.remove(window.id) for window in windows

  @capture: () ->
    tab = getTab(arguments)
    chrome.tabs.captureVisibleTab tab.windowId, {format: 'png'}, (dataUrl) ->
      Post tab, {action: "Window.capture", url: dataUrl}

  @save_page: (msg) ->
    tab = getTab(arguments)
    chrome.pageCapture.saveAsMHTML tabId: tab.id, (mhtml) ->
      filename = (msg.filename || tab.title).replace(/(.mhtml)?$/, '.mhtml')
      saveAs(mhtml, filename)
      Post tab, {action: "Window.saveas", data: mhtml, filename: filename}


  @moveTabToWindowWithIncognito: (tab, incognito, callback) ->
    chrome.windows.getAll {populate: true}, (windows) ->
      for window in windows
        if (window.type is "normal") and (window.incognito is incognito) and (window.id isnt tab.windowId)
          chrome.tabs.create windowId: window.id, url: tab.url
          callback(tab) if callback
          return true

      # not returned
      chrome.windows.create url: tab.url, incognito: incognito
      callback(tab) if callback


root = exports ? window
root.Window = Window
