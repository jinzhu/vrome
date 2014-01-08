class Window
  @create: ->
    chrome.windows.create()

  @close: (msg) ->
    chrome.windows.remove msg.tab.windowId

  @closeAll: ->
    chrome.windows.getAll (windows) ->
      chrome.windows.remove window.id for window in windows
      return

  @capture: (msg) ->
    chrome.tabs.captureVisibleTab msg.tab.windowId, format: 'png', (url) ->
      Post msg.tab, {action: 'Window.capture', url}

  @save_page: (msg) ->
    chrome.pageCapture.saveAsMHTML tabId: msg.tab.id, (mhtml) ->
      filename = (msg.filename or msg.tab.title).replace(/(.mhtml)?$/, '.mhtml')
      saveAs mhtml, filename
      Post msg.tab, {action: 'Window.saveas', data: mhtml, filename}

  @moveTabToWindowWithIncognito: (tab, incognito, callback) ->
    chrome.windows.getAll populate: true, (windows) ->
      for window in windows
        if window.type is 'normal' and window.incognito is incognito and window.id isnt tab.windowId
          chrome.tabs.create windowId: window.id, url: tab.url
          callback? tab
          return true

      # not returned
      chrome.windows.create {url: tab.url, incognito}
      callback? tab

root = exports ? window
root.Window = Window
