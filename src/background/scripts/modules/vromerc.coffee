window.Vromerc = (->
  
  # all tokens related to config here. -- in case we need to change them
  # TODO: refactor existing tokens + make this available via /shared/
  parse = (text) ->
    res = null
    setting = {}
    setting.imap = {}
    setting.map = {}
    setting.cmap = {}
    setting.unmap = {}
    setting.iunmap = {}
    setting.set = {}
    setting.js = {}
    new_configs = []
    setting.js = text.extractStringBetweenBlocks(Tokens.customJSBegin, Tokens.customJSEnd)
    setting.css = text.extractStringBetweenBlocks(Tokens.customCSSBegin, Tokens.customCSSEnd)
    url_marks = Settings.get("url_marks") or {}
    configs = text.split("\n")
    i = 0

    while i < configs.length
      config = configs[i].trim()
      array = config.split(/\s+/)
      switch array[0]
        when "imap"
          new_configs.push config
          setting.imap[array[1]] = array[2]
        when "map"
          new_configs.push config
          setting.map[array[1]] = array[2]
        when "cmap"
          new_configs.push config
          setting.cmap[array[1]] = array[2]
        when "unmap"
          new_configs.push config
          setting.unmap[array[1]] = true
        when "iunmap"
          new_configs.push config
          setting.iunmap[array[1]] = true
        when "set"
          new_configs.push config
          config_left = config.trimFirst(array[0])
          setting_key = config_left.split(/\+?=/)[0]
          setting_value = config_left.trimFirst(setting_key + "=").trimFirst(setting_key + "+=")
          setting_value = Number(setting_value)  unless isNaN(setting_value)
          plus = ((if config.match(/^\s*set\s+\w+\+=/) then true else false))
          if setting_key.startsWith("qm_")
            url_marks[setting_key.replace("qm_", "")] = setting_value
          else
            setting.set[setting_key] = [setting_value, plus]
        else
          if config.match(/^\s*$/)
            new_configs.push config
          else
            new_configs.push config.replace(/^"?\s{0,1}/, "\" ")
      i++
    Settings.add "url_marks", url_marks
    Settings.add configure: setting
    res = new_configs.join("\n")
    res = fixCustomBlocks(res)
    res
  
  # fix custom JS block so it is not in comments
  fixCustomBlocks = (res) ->
    _.each res.extractStringBetweenBlocks(Tokens.customJSBegin, Tokens.customJSEnd, true), (v) ->
      res = res.replace(v, v.split("\n\" ").join("\n"))

    _.each res.extractStringBetweenBlocks(Tokens.customCSSBegin, Tokens.customCSSEnd, true), (v) ->
      res = res.replace(v, v.split("\n\" ").join("\n"))

    res
  loadAll = (scheduleNextReload) ->
    loadOnline scheduleNextReload
    loadLocal()
  loadLocal = ->
    
    # local .vromerc file using server
    $.ajax(url: getLocalServerUrl()).done (data) ->
      if data
        vromerc = "\" Begin Local Vromerc generated\n" + data + "\n\" End Local Vromerc generated\n\n"
        vromerc = vromerc + Settings.get("vromerc").replace(/" Begin Local Vromerc generated\n(.|\n)+\n" End Local Vromerc generated\n?\n?/g, "")
        Settings.add vromerc: parse(vromerc)

  loadOnline = (scheduleNextReload) -> #Boolean
    url = Settings.get("onlineVromercUrl")
    return false  unless url
    url = "http://" + url  unless url.match(/^http/)
    if scheduleNextReload and Settings.get("onlineVromercReloadInterval")
      interval = Settings.get("onlineVromercReloadInterval") * 1000 * 60
      setTimeout (->
        Vromerc.loadOnline true
      ), interval
    xhr = new XMLHttpRequest()
    xhr.open "GET", url, false
    xhr.onreadystatechange = ->
      if xhr.readyState is 4
        if xhr.status is 200
          vromerc = "\" Begin Online Vromerc generated\n" + xhr.responseText + "\n\" End Online Vromerc generated\n\n"
          vromerc = vromerc + Settings.get("vromerc").replace(/" Begin Online Vromerc generated\n(.|\n)+\n" End Online Vromerc generated\n?\n?/g, "")
          Settings.add vromerc: parse(vromerc)
          Settings.add onlineVromercLastUpdatedAt: new Date().toString()

    xhr.send()
    true
  Tokens =
    customJSBegin: "begin_custom_js"
    customJSEnd: "end_custom_js"
    customCSSBegin: "begin_custom_css"
    customCSSEnd: "end_custom_css"

  parse: parse
  loadOnline: loadOnline
  loadAll: loadAll
  loadLocal: loadLocal
)()
