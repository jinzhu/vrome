class Settings
  key = '__vrome_setting'

  currentSetting = ->
    try
      JSON.parse localStorage[key]
    catch error
      {}


  @add: (value) ->
    settings = currentSetting()

    if $.isPlainObject value
      $.extend(settings, value)
    else
      [names, value] = [arguments[0].split('.'), arguments[1]]
      s = settings
      s = (s[name] || {}) while name in names.slice 0, names.length-1
      s[names[names.length-1]] = value
      settings = s

    localStorage[key] = JSON.stringify(settings)
    return settings


  @get: (names) ->
    settings = currentSetting()
    return settings unless names

    try
      (settings = settings[name]) for name in names.split('.')
    catch error
      return ""

    settings


root = exports ? window
root.Settings = Settings
