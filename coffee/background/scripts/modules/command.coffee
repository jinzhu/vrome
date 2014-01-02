class Command

  @source: (msg) ->
    for src in msg.sources.split(",")
      src = src.trim()
      src = Option.get('sources_map')[src[1..-1]] if src.startsWith("@")
      src = src.replace(/(^https?:\/\/)?/, 'http://') if /^(\w+\.)+\w+\//.test(src)

      if src.startsWith("http")
        data = if src.match(/js$/)
          "var script = document.createElement('script'); script.setAttribute('src', '#{src}'); document.body.appendChild(script);"
        else if src.match(/css$/)
          "var script = document.createElement('link'); script.setAttribute('href', '#{src}'); script.setAttribute('rel', 'stylesheet'); document.body.appendChild(script);"
        chrome.tabs.executeScript(msg.tab.id, code: data)
        # $.ajax type: 'GET', url: src, dataType : 'text', success: (data) -> injectCode(data, src, msg.tab)
    return


root = exports ? window
root.Command = Command
