class Vromerc
  @init: =>
    @loadAll true
    # Reload every 5 minutes
    interval = (Settings.get('onlineVromercReloadInterval') or 5) * 1000 * 60
    setInterval Vromerc.loadAll, interval

  @loadAll: =>
    @loadOnline()
    @loadLocal()

  @parse: (text) ->
    settings =
      map:    {}
      unmap:  {}
      imap:   {}
      iunmap: {}
      cmap:   {}
      set:    {}

    configs = []
    urlMarks = Settings.get('url_marks') or {}

    for line in text.split '\n'
      line = line.trim()
      [method, key, value] = line.split /\s+/

      if method in ['imap', 'map', 'cmap']
        configs.push line
        settings[method][key] = value
      else if method in ['unmap', 'iunmap']
        configs.push line
        settings[method][key] = true
      else if method in ['set']
        configs.push line
        config = line.trimFirst(method)

        settingKey   = config.split(/\+?=/)[0]
        settingValue = config.trimFirst(settingKey + '=').trimFirst(settingKey + '+=')
        settingValue = Number settingValue unless isNaN settingValue
        # set xxx+=xxxxx
        isPlus       = /^\s*set\s+\w+\+=/.test line

        if settingKey.startsWith 'qm_'
          urlMarks[settingKey.replace 'qm_', ''] = settingValue
        else
          settings.set[settingKey] = [settingValue, isPlus]
      else if /^\s*$/.test line
        configs.push line
      else
        # comment this line
        configs.push line.replace /^"?\s{0,1}/, '" '

    Settings.add 'url_marks', urlMarks
    # Replace configure, don't extend it
    Settings.add 'configure', settings
    configs.join '\n'

  @loadLocal: ->
    $.get(getLocalServerUrl()).done (data) =>
      if data
        vromerc = "\" Begin Local Vromerc generated\n#{data}\n\" End Local Vromerc generated\n\n"
        vromerc += (Settings.get('vromerc') or '').replace(/" Begin Local Vromerc generated\n(.|\n)+\n" End Local Vromerc generated\n?\n?/g, '')
        Settings.add vromerc: @parse(vromerc)

  @loadOnline: () ->
    url = Settings.get 'onlineVromercUrl'
    return false unless url

    url = "http://#{url}" unless url.isValidURL()

    $.get(url).done (data) =>
      vromerc = "\" Begin Online Vromerc generated\n#{data}\n\" End Online Vromerc generated\n\n"
      vromerc += (Settings.get('vromerc') or '').replace(/" Begin Online Vromerc generated\n(.|\n)+\n" End Online Vromerc generated\n?\n?/g, '')
      Settings.add vromerc: @parse(vromerc), onlineVromercLastUpdatedAt: new Date().toString()

root = exports ? window
root.Vromerc = Vromerc
