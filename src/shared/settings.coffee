class Settings
  key = '__vrome_setting'

  currentSetting = ->
    try
      JSON.parse localStorage[key]
    catch error
      {}


  @add: (value) ->
    setting = currentSetting()

    if $.isPlainObject value
      $.extend(setting, value)
    else
      [names, value] = [arguments[0].split('.'), arguments[1]]
      s = (setting[name] = setting[name] || {}) while name in names.slice 0, names.length-1
      s[names[names.length-1]] = value
      setting = s

    localStorage[key] = JSON.stringify(setting)
    return setting


  @get: (names) ->
    setting = currentSetting()
    return setting unless names

    try
      setting = setting[name] for name in names.split('.')
    catch error
      return ""

    setting


root = exports ? window
root.Settings = Settings
