class Window
  @create: ->
    chrome.windows.create()

  @close: (msg) ->
    chrome.windows.remove msg.tab.windowId

  @closeAll: ->
    chrome.windows.getAll (windows) ->
      chrome.windows.remove w.id for w in windows
      return

  @capture: (msg) ->
    chrome.tabs.captureVisibleTab msg.tab.windowId, format: 'png', (url) ->
      Post msg.tab, {action: 'Window.capture', url}

  @savePage: (msg) ->
    chrome.pageCapture.saveAsMHTML tabId: msg.tab.id, (mhtml) ->
      filename = (msg.filename or msg.tab.title).replace(/(.mhtml)?$/, '.mhtml')
      saveAs mhtml, filename
      Post msg.tab, {action: 'Window.saveAs', data: mhtml, filename}

  @moveTabToWindowWithIncognito: (tab, incognito, callback) ->
    chrome.windows.getAll populate: true, (windows) ->
      for w in windows
        if w.type is 'normal' and w.incognito is incognito and w.id isnt tab.windowId
          chrome.tabs.create windowId: w.id, url: tab.url
          callback? tab
          return

      # not returned
      chrome.windows.create {url: tab.url, incognito}
      callback? tab

root = exports ? window
root.Window = Window
