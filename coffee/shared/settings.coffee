# API
#
# Setting.add {}, :scope_key => "background"/"host" -> scope_key as key, default is 'background'
# Setting.get '@key', :scope_key => ''              -> scope_key as key, default is 'background'
# Setting.get 'key', :scope_key => ''               -> scope_key as key, default is get_key()

class Settings
  key = '__vrome_setting'
  [sync, local, @settings] = [chrome.storage.sync, chrome.storage.local, {}]

  get_key = (args=[]) ->
    [scope_key, hostname] = [args[args.length-1]?['scope_key'], document.location.hostname]
    if scope_key
      scope_key = (hostname || "other") if scope_key is "host"
    else
      scope_key = if $.isPlainObject args[0]
        "background"
      else if (typeof args[0] is 'string') and args[0].startsWith("@")
        "background"
      else if (hostname isnt "") and hostname.match(/^\w+$/) and not hostname.match(/local/)
        "background"
      else
        hostname || "other"
    scope_key

  syncLocal = (callback) =>
    local_key = get_key(arguments)
    local.get local_key, (obj) => @settings[local_key] = obj[local_key] if local_key isnt "background"
    local.get "background", (obj) =>
      try
        @settings["background"] = obj['background'] || JSON.parse(localStorage['__vrome_setting'] || "{}")
        callback.call() if $.isFunction callback
      catch err
        @settings["background"] = {}
      finally
        sync.get "background", (robj) => $.extend(@settings["background"], robj["background"])

  syncBack = =>
    local.set(@settings)
    @settings

  syncToRemote = =>
    sync.set(background: @settings["background"])

  @init: (callback) =>
    syncLocal(callback)
    setInterval syncToRemote, 1000 * 60 if get_key() is 'background' # Backup to Remote server every 1 minutes 
    chrome.storage.onChanged.addListener (changes, namespace) =>
      syncLocal()

  @add: (values) =>
    local_key = get_key(arguments)
    @settings[local_key] = $.extend({}, @settings[local_key] || {}, values) if $.isPlainObject values

    syncBack()

  @get: (names) =>
    try
      settings = @settings[get_key(arguments)]
      (settings = settings[name]) for name in names.trimFirst("@").split('.') if names
      settings
    catch error
      ""


root = exports ? window
root.Settings = Settings
