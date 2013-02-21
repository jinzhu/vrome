# API
#
# Setting.add {}, :scope_key => "background"/"host" -> scope_key as key, default is 'background'
# Setting.add '@key', 'value', :scope_key => ''     -> scope_key as key, default is 'background'
# Setting.add 'key', 'value', :scope_key => ''      -> scope_key as key, default is get_key()
# Setting.get '@key', :scope_key => ''              -> scope_key as key, default is 'background'
# Setting.get 'key', :scope_key => ''               -> scope_key as key, default is get_key()

class Settings
  key = '__vrome_setting'
  [sync, local] = [chrome.storage.sync, chrome.storage.local]

  try
    @settings = JSON.parse(localStorage[key] || "{}")
  catch err
    @settings = {}

  get_key = () ->
    [scope_key, hostname] = [arguments[arguments.length-1]?['scope_key'], document.location.hostname]
    if scope_key
      scope_key = (hostname || "other") if scope_key is "host"
    else
      scope_key = if $.isPlainObject arguments[0]
        "background"
      else if (typeof arguments[0] is 'string') and arguments[0].startsWith("@")
        "background"
      else if (hostname isnt "") and hostname.match(/^\w+$/) and not hostname.match(/local/)
        "background"
      else
        hostname || "other"
    scope_key

  @init: =>
    @sync()
    chrome.storage.onChanged.addListener @sync

  @sync: =>
    local_key = get_key(arguments)
    local.get(local_key, (obj) => @settings[local_key] = obj.value) if local_key isnt "background"
    sync.get "background", (obj) => @settings["background"] = obj.value

  @syncBack: =>
    sync.set("background": @settings["background"])
    for k, value of @settings when k isnt "background"
      data = {}
      data[k] = value
      local.set(data)
    localStorage[key] = JSON.stringify(@settings)
    @settings

  @add: (value) =>
    local_key = get_key(arguments)
    @settings[local_key] = if $.isPlainObject value
      $.extend(@settings[local_key] || {}, value)
    else
      [names, value, setting] = [arguments[0].split('.'), arguments[1], @settings[local_key] || {}]
      setting = (setting[name] || {}) for name in names[0...-1]
      setting[names[names.length-1]] = value
      setting
    @syncBack()

  @get: (names) =>
    try
      settings = @settings[get_key(arguments)]
      (settings = settings[name]) for name in names.split('.') if names
      settings
    catch error
      ""


root = exports ? window
root.Settings = Settings
