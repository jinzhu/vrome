# This file provide APIs used for Vrome to save/get settings
# There are two kinds of settings:
#   * Global settings, like key mapping
#   * Domain specific settings, like last time's zoom level when visiting current domain's pages
#
# Vrome using scope_key to identify what kind of setting you are requesting:
#   Using scope key 'background' for global settings
#   Using scope key 'host' for domain specific settings, vrome will save/look up settings with current visiting page's hostname
#
# For example:
#    Setting.add setting_key, setting_value, :scope_key => "background"
#    Setting.add setting_key, setting_value, :scope_key => "host"
#    Setting.get setting_key, :scope_key => "background"
#    Setting.get setting_key, :scope_key => "host"
#
# And in order to make settings easy to use, Vrome has some conventions:
#
# 1, If current visit page is background page (e.g: vrome option page), then scope key is `background`, otherwise, scope key is 'host'
#
# 2, when saving setting, if the value is an object, then default scope key is `background`
#
#    Setting.add {setting_key: setting_value}
#
# 3, If setting key is started with "@", then default scope key is `background`
#
#    Setting.add "@setting_key", setting_value
#    Setting.get "@setting_key"


class window.Settings
  [sync, local, settings] = [chrome.storage.sync, chrome.storage.local, {}]

  getKey = (args=[]) ->
    [scopeKey, hostname] = [args[args.length-1]?['scope_key'], document.location.hostname]
    # Background pages, url looks like chrome-extension://hjkbcadlghpfpjnlecbdihlfdfaijnoh/background/html/options.html
    scopeKey = 'background' if /^\w+$/.test(hostname) and not /local/.test hostname

    # if specified scope key
    if scopeKey
      # if specified scope key is `host`, then use current page's hostname as the setting key
      scopeKey = hostname if scopeKey is 'host'
    else # if no specified scope key
      # if the setting value is object
      scopeKey = if $.isPlainObject args[0]
        'background'
      # if the setting key is started with @
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
        callback?.call()

  syncRemote = ->
    syncToRemote = -> sync.set background: settings['background']
    setInterval syncToRemote, 1000 * 60

    settings['background'] ?= {}
    sync.get 'background', (obj) -> $.extend settings['background'], obj['background']

  @init: (callback) ->
    syncRemote() if getKey() is 'background'
    syncLocal callback
    chrome.storage.onChanged.addListener syncLocal

  @add: (values) ->
    localKey = getKey arguments
    if $.isPlainObject values
      settings[localKey] ?= {}
      $.extend true, settings[localKey], values
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
      if names and (setting = setting[getKey arguments])
        (setting = setting[name]) for name in names.trimFirst('@').split('.')
      setting
