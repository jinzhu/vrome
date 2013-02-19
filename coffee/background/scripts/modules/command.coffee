class Command

  injectCode = (data, src) ->
    tab = getTab(arguments)

    if src.match(/js$/)
      chrome.tabs.executeScript(tab?.id, code: data)
    else if src.match(/css$/)
      chrome.tabs.insertCSS(tab?.id, code: data)

  @source: (msg) ->
    tab = getTab(arguments)

    for src in msg.sources.split(",")
      src = src.trim()

      if src.startsWith("http")
        $.ajax type: 'GET', url: src, dataType : 'text', success: (data) -> injectCode(data, src, tab)


root = exports ? window
root.Command = Command
