# API
#
# Setting.add {}, :scope_key => "background"/"host" -> scope_key as key, default is 'background'
# Setting.add '@key', 'value', :scope_key => ''     -> scope_key as key, default is 'background'
# Setting.add 'key', 'value', :scope_key => ''      -> scope_key as key, default is get_key()
# Setting.get '@key', :scope_key => ''              -> scope_key as key, default is 'background'
# Setting.get 'key', :scope_key => ''               -> scope_key as key, default is get_key()

class Settings
  [sync, local, @settings] = [chrome.storage.sync, chrome.storage.local, {}]

  get_key = () ->
    hostname = document.location.hostname
    return "background" if (hostname isnt "") and hostname.match(/^\w+$/) and not hostname.match(/local/)
    hostname || "other"

  is_background = ->
    get_key() is "background"

  @sync: =>
    local_key = get_key()
    local.get local_key, (obj) => @settings[local_key] = obj.value unless is_background
    sync.get "background", (obj) => @settings["background"] = obj.value

  @syncBack: =>
    sync.set("background": @settings["background"])
    for key, value of @settings when key isnt "background"
      data = {}
      data[key] = value
      local.set(data)

  @add: (value) =>
    # TODO guess key
    if $.isPlainObject value
      $.extend(@settings, value)
    else
      [names, value, s] = [arguments[0].split('.'), arguments[1], @settings]
      s = (s[name] || {}) for name in names[0...-1]
      s[names[names.length-1]] = value

    @settings


  @get: (names) ->
    try
      settings = @settings
      (settings = settings[name]) for name in names.split('.') if names
      settings
    catch error
      ""


root = exports ? window
root.Settings = Settings
