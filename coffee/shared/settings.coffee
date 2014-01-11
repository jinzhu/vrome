# API
#
# Setting.add {}, :scope_key => "background"/"host" -> scope_key as key, default is 'background'
# Setting.add '@key', 'value', :scope_key => ''     -> scope_key as key, default is 'background'
# Setting.add 'key', 'value', :scope_key => ''      -> scope_key as key, default is getKey()'
# Setting.get '@key', :scope_key => ''              -> scope_key as key, default is 'background'
# Setting.get 'key', :scope_key => ''               -> scope_key as key, default is getKey()

class Settings
  [sync, local, settings] = [chrome.storage.sync, chrome.storage.local, {}]

  getKey = (args=[]) ->
    [scopeKey, hostname] = [args[args.length-1]?['scope_key'], document.location.hostname]
    scopeKey = 'background' if hostname isnt '' and hostname.match(/^\w+$/) and not hostname.match /local/

    if scopeKey
      scopeKey = hostname if scopeKey is 'host'
    else
      scopeKey = if $.isPlainObject args[0]
        'background'
      else if typeof args[0] is 'string' and args[0].startsWith '@'
        'background'
      else
        hostname
    scopeKey or 'other'

  syncLocal = (callback) ->
    localKey = getKey arguments
    if localKey isnt 'background'
      local.get localKey, (obj) -> settings[localKey] = obj[localKey]
    local.get 'background', (obj) ->
      try
        settings['background'] = obj['background'] or JSON.parse(localStorage['__vrome_setting'] or '{}')
        callback.call() if $.isFunction callback

  syncRemote = ->
    syncToRemote = -> sync.set background: settings['background']
    setInterval syncToRemote, 1000 * 60

    settings['background'] ?= {}
    sync.get 'background', (obj) -> $.extend(settings['background'], obj['background'])

  @init: (callback) ->
    syncRemote() if getKey() is 'background'
    syncLocal callback
    chrome.storage.onChanged.addListener syncLocal

  @add: (values) ->
    localKey = getKey(arguments)
    if $.isPlainObject values
      settings[localKey] ?= {}
      $.extend(true, settings[localKey], values)
    else
      [names, value, setting] = [arguments[0].trimFirst('@').split('.'), arguments[1], settings[localKey]]
      for name in names[0...-1]
        setting[name] ?= {}
        setting = setting[name]
      setting[names[names.length-1]] = value

    local.set settings

  @get: (names) ->
    try
      setting = settings
      if names and (setting = setting[getKey(arguments)])
        (setting = setting[name]) for name in names.trimFirst('@').split('.')
      setting

root = exports ? window
root.Settings = Settings
