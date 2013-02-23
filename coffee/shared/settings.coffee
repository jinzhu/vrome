# API
#
# Setting.add {}, :scope_key => "background"/"host" -> scope_key as key, default is 'background'
# Setting.add '@key', 'value', :scope_key => ''     -> scope_key as key, default is 'background'
# Setting.add 'key', 'value', :scope_key => ''      -> scope_key as key, default is get_key()'
# Setting.get '@key', :scope_key => ''              -> scope_key as key, default is 'background'
# Setting.get 'key', :scope_key => ''               -> scope_key as key, default is get_key()

class Settings
  [sync, local, settings] = [chrome.storage.sync, chrome.storage.local, {}]

  get_key = (args=[]) ->
    [scope_key, hostname] = [args[args.length-1]?['scope_key'], document.location.hostname]
    scope_key = "background" if (hostname isnt "") and hostname.match(/^\w+$/) and not hostname.match(/local/)

    if scope_key
      scope_key = hostname if scope_key is "host"
    else
      scope_key = if $.isPlainObject args[0]
        "background"
      else if (typeof args[0] is 'string') and args[0].startsWith("@")
        "background"
      else
        hostname
    scope_key || "other"

  syncLocal = (callback) =>
    local_key = get_key(arguments)
    local.get local_key, (obj) => settings[local_key] = obj[local_key] if local_key isnt "background"
    local.get "background", (obj) =>
      try
        settings["background"] = obj['background'] || JSON.parse(localStorage['__vrome_setting'] || "{}")
        callback.call() if $.isFunction callback

  syncRemote = ->
    syncToRemote = => sync.set(background: settings["background"])
    setInterval syncToRemote, 1000 * 60

    settings["background"] ||= {}
    sync.get "background", (obj) => $.extend(settings["background"], obj["background"])


  @init: (callback) =>
    syncRemote() if get_key() is 'background'
    syncLocal(callback)
    chrome.storage.onChanged.addListener syncLocal


  @add: (values) =>
    local_key = get_key(arguments)
    if $.isPlainObject values
      settings[local_key] ||= {}
      $.extend(true, settings[local_key], values)
    else
      [names, value, setting] = [arguments[0].trimFirst("@").split('.'), arguments[1], settings[local_key]]
      for name in names[0...-1]
        setting[name] ||= {}
        setting = setting[name]
      setting[names[names.length-1]] = value

    local.set settings


  @get: (names) =>
    try
      setting = settings
      if names and (setting = setting[get_key(arguments)])
        (setting = setting[name]) for name in names.trimFirst("@").split('.')
      setting


root = exports ? window
root.Settings = Settings
