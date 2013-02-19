class Command

  @source: (msg) ->
    tab = getTab(arguments)

    for src in msg.sources.split(",")
      src = src.trim()

      if src.startsWith(/http/)
        if src.match(/.js$/)
          chrome.tabs.executeScript(tab.id, file: src)
        else if src.match(/.css$/)
          chrome.tabs.insertCSS(tab.id, file: src)


root = exports ? window
root.Command = Command
