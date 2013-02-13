class Vromerc
  
  @init: =>
    @loadAll true


  @parse: (text) ->
    setting = {}
    [setting.imap, setting.map, setting.cmap, setting.unmap, setting.iunmap, setting.set] = [{}, {}, {}, {}, {}, {}]

    configs = []
    url_marks = Settings.get("url_marks") or {}

    for line in text.split("\n")
      line = line.trim()
      [method, key, value] = line.split(/\s+/)

      if method in ["imap", "map", "cmap"]
        configs.push line
        setting[method][key] = value
      else if method in ["unmap", "iunmap"]
        configs.push line
        setting[method][key] = true
      else if method in ["set"]
        configs.push line
        config = line.trimFirst(method)

        setting_key   = line.split(/\+?=/)[0]
        setting_value = line.trimFirst(setting_key + "=").trimFirst(setting_key + "+=")
        setting_value = Number(setting_value) unless isNaN(setting_value)
        # set xxx+=xxxxx
        is_plus       = (if line.match(/^\s*set\s+\w+\+=/) then true else false)

        if setting_key.startsWith("qm_")
          url_marks[setting_key.replace("qm_", "")] = setting_value
        else
          setting.set[setting_key] = [setting_value, is_plus]
      else if line.match(/^\s*$/)
          configs.push line
      else
        # comment this line
        configs.push line.replace(/^"?\s{0,1}/, "\" ")

    Settings.add url_marks: url_marks, configure: setting
    configs.join("\n")
  

  @loadAll: (scheduleNextReload) ->
    @loadOnline scheduleNextReload
    @loadLocal()
    syncSettingAllTabs()


  @loadLocal: ->
    $.get(getLocalServerUrl()).done (data) =>
      if data
        vromerc = "\" Begin Local Vromerc generated\n#{data}\n\" End Local Vromerc generated\n\n"
        vromerc = vromerc + (Settings.get("vromerc") ? "").replace(/" Begin Local Vromerc generated\n(.|\n)+\n" End Local Vromerc generated\n?\n?/g, "")
        Settings.add vromerc: @parse(vromerc)


  @loadOnline: (scheduleNextReload) ->
    url = Settings.get("onlineVromercUrl")
    return false unless url

    url = "http://" + url unless url.match(/^http/)

    if scheduleNextReload and Settings.get("onlineVromercReloadInterval")
      interval = Settings.get("onlineVromercReloadInterval") * 1000 * 60
      setTimeout (-> Vromerc.loadOnline true), interval

    $.get(url).done (data) =>
      vromerc = "\" Begin Online Vromerc generated\n#{data}\n\" End Online Vromerc generated\n\n"
      vromerc = vromerc + (Settings.get("vromerc") ? "").replace(/" Begin Online Vromerc generated\n(.|\n)+\n" End Online Vromerc generated\n?\n?/g, "")
      Settings.add vromerc: @parse(vromerc), onlineVromercLastUpdatedAt: new Date().toString()


root = exports ? window
root.Vromerc = Vromerc
