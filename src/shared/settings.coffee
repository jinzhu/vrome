Settings = (->
  
  # 'scripts': '__vrome_scripts',
  
  # background or not, it now means the same thing. Because we sync everything in the background page's local storage
  # TODO: remove "background." calls and just use the key name instead e.g "times" instead of "background.times"
  
  ###
  returns settings as object
  @name name of local storage key
  ###
  
  # core settings is where pretty much everything is
  
  # given a string, it returns the valid prefix from that string
  
  # retrieves settings based on value
  # value could start by a prefix like hosts or background which would indicate we have to check another storage key
  
  # merges values from object2 into object1
  
  # Note(hbt): no need for recursive checks because no data is left out when storing in background or locally
  
  # removes prefix from string or Object
  
  # remove prefix if there is one
  
  # do we have at least one key in the Object that's in the map'
  
  # move value to top level
  
  # copy the rest
  
  # adds custom prefix to object e.g host name
  
  # if this is host information, add the host name at the top level
  
  # called from the front page to update the local storage in the background page
  syncBackgroundStorage = (value, prefix) ->
    obj = SettingsUtils.getCurrentSettings(prefix)
    obj = SettingsUtils.mergeValues(obj, value)
    localStorage[SettingsUtils.getStorageName(prefix)] = JSON.stringify(obj)
  
  # called from the background page to sync settings to the current tab
  syncTabStorage = (tab) ->
    _.each _.keys(keyMap), (v) ->
      obj = SettingsUtils.getCurrentSettings(v)
      
      # transform object
      switch v
        when "hosts"
          obj = obj[getHostname(tab.url)]
      
      # send it
      Post tab,
        action: "Settings.add"
        arguments: [obj, v]


  
  ###
  @value accepts Object{} or Strings (key)
  @arg value if @value is a string
  ###
  add = (value) ->
    arg = undefined
    prefix = undefined
    calledFromBackground = undefined
    
    # prefix is passed from background page
    prefix = arguments_[1]  if arguments_.length > 1
    
    # arg is the value, prefix is extracted
    if _.isString(value)
      arg = arguments_[1]
      prefix = SettingsUtils.getPrefix(value) or "background"
      calledFromBackground = false
    else calledFromBackground = true  if _.isObject(value)
    
    # get data based on prefix
    obj = SettingsUtils.getCurrentSettings(prefix)
    
    # transform string to object
    fvalue = SettingsUtils.removePrefixFromValue(value)
    obj2 = fvalue
    
    # create object
    if _.isString(fvalue)
      obj2 = {}
      arr = fvalue.split(".")
      obj2[arr.pop()] = arg
      obj2[arr.pop()] = _.clone(obj2)  while arr.length > 0
    
    # merge
    obj = SettingsUtils.mergeValues(obj, obj2)
    
    # save in local storage
    localStorage[SettingsUtils.getStorageName(prefix)] = JSON.stringify(obj)
    
    # Note(hbt): This is necessary because the settings are sent asynchronously and therefore runIt could be initialized before any settings are stored
    # in the localstorage of the site
    if calledFromBackground and prefix is "background" and not window.ranCustomJS
      window.ranCustomJS = true
      $(document).ready ->
        
        # Initial
        try
          runIt [Frame.register, CustomCode.runJS, CustomCode.loadCSS]
        catch err
          logError err

    
    # sync in background storage
    if (typeof (checkNewVersion) isnt "function") and not calledFromBackground
      obj = SettingsUtils.transformObject(obj, prefix)
      Post
        action: "Settings.syncBackgroundStorage"
        arguments: [obj, prefix]

  get = (names) ->
    object = SettingsUtils.getCurrentSettings(names)
    return object  unless names
    names = SettingsUtils.removePrefixFromValue(names)
    names = names.split(".")
    object = object[names.shift()]  while object and names[0]
    (if (typeof object is "undefined") then "" else object)
  key = "__vrome_setting"
  keyMap =
    hosts: "__vrome_hosts"
    background: "__vrome_setting"

  SettingsUtils =
    getSettings: (name) ->
      res = {}
      try
        res = JSON.parse(localStorage[name] or "{}")
      catch e
        localStorage[name] = "{}"
        res = {}
      res

    getCoreSettings: ->
      SettingsUtils.getSettings keyMap["background"]

    getPrefix: (value) ->
      return null  unless _.isString(value)
      res = null
      prefix = value
      prefix = value.substring(0, value.indexOf("."))  if value.indexOf(".") isnt -1
      res = (if _.chain(keyMap).keys().contains(prefix).value() then prefix else null)
      res

    getCurrentSettings: (value) ->
      SettingsUtils.getSettings SettingsUtils.getStorageName(value)

    getStorageName: (value) ->
      res = key
      if _.isString(value)
        prefix = SettingsUtils.getPrefix(value)
        res = (if prefix then keyMap[prefix] else key)
      res = res or key
      res

    mergeValues: (object1, object2) ->
      res = object1
      if _.isObject(object1) and _.isObject(object2)
        for i of object2
          res[i] = object2[i]
      res

    removePrefixFromValue: (value) ->
      res = value
      if _.isString(value)
        prefix = SettingsUtils.getPrefix(value)
        res = (if prefix then value.replace(prefix + ".", "") else value)
      else if _.isObject(value)
        keyMapKeys = _.keys(keyMap)
        if _.chain(value).keys().intersection(keyMapKeys).value() isnt 0
          res = {}
          for i of value
            if _.contains(keyMap, i)
              for j of value[i]
                res[j] = value[i][j]
            else
              res[i] = value[i]
      res

    transformObject: (obj, prefix) ->
      res = {}
      if prefix is "hosts"
        tmp = {}
        tmp[window.location.host] = obj
        obj = tmp
      res = obj
      res

  add: add
  get: get
  syncBackgroundStorage: syncBackgroundStorage
  syncTabStorage: syncTabStorage
  getPrefix: SettingsUtils.getPrefix
)()
