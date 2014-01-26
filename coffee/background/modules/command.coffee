class window.Command
  @source: (msg) ->
    for src in msg.sources.split ','
      src = src.trim()
      src = Option.get('sources_map')[src[1..-1]] if src.startsWith '@'
      src = "http://#{src}" unless src.isValidURL()

      if src.startsWith 'http'
        msg.code = if src.endsWith 'js'
          "var script = document.createElement('script'); script.setAttribute('src', '#{src}'); document.body.appendChild(script);"
        else if src.endsWith 'css'
          "var script = document.createElement('link'); script.setAttribute('href', '#{src}'); script.setAttribute('rel', 'stylesheet'); document.body.appendChild(script);"
        runScript msg
        # $.ajax type: 'GET', url: src, dataType : 'text', success: (data) -> injectCode(data, src, msg.tab)
    return
