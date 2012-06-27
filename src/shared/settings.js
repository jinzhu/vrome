var Settings = (function() {
  var key = '__vrome_settings';

  var keyMap = {
    //    'scripts': '__vrome_scripts',
    'hosts': '__vrome_hosts',
    // background or not, it now means the same thing. Because we sync everything in the background page's local storage
    'background': '__vrome_settings' // TODO: remove "background." calls and just use the key name instead e.g "times" instead of "background.times"
  }

  SettingsUtils = {

    /**
     * returns settings as object
     * @name name of local storage key
     */
    getSettings: function(name) {
      var res = {}
      try {
        res = JSON.parse(localStorage[name] || "{}");
      } catch (e) {
        localStorage[name] = "{}"
        res = {}
      }

      return res
    },

    // core settings is where pretty much everything is
    getCoreSettings: function() {
      return SettingsUtils.getSettings(keyMap['background'])
    },

    // given a string, it returns the valid prefix from that string
    getPrefix: function(value) {
      if (!_.isString(value)) return null

      var res = null

      var prefix = value
      if (value.indexOf('.') !== -1) {
        prefix = value.substring(0, value.indexOf('.'))
      }
      res = _.chain(keyMap).keys().contains(prefix).value() ? prefix : null

      return res
    },

    // retrieves settings based on value
    // value could start by a prefix like hosts or background which would indicate we have to check another storage key
    getCurrentSettings: function(value) {
      return SettingsUtils.getSettings(SettingsUtils.getStorageName(value))
    },

    getStorageName: function(value) {
      var res = key;
      if (_.isString(value)) {
        var prefix = SettingsUtils.getPrefix(value)
        res = prefix ? keyMap[prefix] : key
      }

      res = res || key
      return res
    },

    // merges values from object2 into object1
    mergeValues: function(object1, object2) {
      var res = object1

      // Note(hbt): no need for recursive checks because no data is left out when storing in background or locally
      if (_.isObject(object1) && _.isObject(object2)) {
        for (var i in object2) {
          res[i] = object2[i];
        }
      }

      return res
    },

    // removes prefix from string or Object
    removePrefixFromValue: function(value) {
      var res = value

      if (_.isString(value)) {

        // remove prefix if there is one
        var prefix = SettingsUtils.getPrefix(value)
        res = prefix ? value.replace(prefix + '.', '') : value
      } else if (_.isObject(value)) {
        // do we have at least one key in the Object that's in the map'
        var keyMapKeys = _.keys(keyMap)
        if (_.chain(value).keys().intersection(keyMapKeys).value() !== 0) {
          res = {}
          for (var i in value) {
            if (_.contains(keyMap, i)) {

              // move value to top level
              for (var j in value[i]) {
                res[j] = value[i][j]
              }
            } else {

              // copy the rest
              res[i] = value[i]
            }
          }
        }
      }

      return res
    },

    // adds custom prefix to object e.g host name
    transformObject: function(obj, prefix) {
      var res = {}

      // if this is host information, add the host name at the top level
      if (prefix === 'hosts') {
        var tmp = {}
        tmp[window.location.host] = obj
        obj = tmp
      }

      res = obj
      return res
    }

  }

  // called from the front page to update the local storage in the background page

  function syncBackgroundStorage(value, prefix) {
    var obj = SettingsUtils.getCurrentSettings(prefix)
    obj = SettingsUtils.mergeValues(obj, value)
    localStorage[SettingsUtils.getStorageName(prefix)] = JSON.stringify(obj)
  }

  // called from the background page to sync settings to the current tab

  function syncTabStorage(tab) {
    _.each(_.keys(keyMap), function(v) {
      var obj = SettingsUtils.getCurrentSettings(v)

      // transform object
      switch (v) {
      case 'hosts':
        obj = obj[getHostname(tab.url)]
        break;
      }

      // send it
      Post(tab, {
        action: "Settings.add",
        arguments: [obj, v]
      });

    })
  }

  /**
   * @value accepts Object{} or Strings (key)
   * @arg value if @value is a string
   */

  function add(value) {
    var arg, prefix, calledFromBackground

    // arg is the value, prefix is extracted
    if (_.isString(value)) {
      arg = arguments[1]
      prefix = SettingsUtils.getPrefix(value) || 'background'
      calledFromBackground = false;
    } else if (_.isObject(value) && arguments.length > 1) {
      calledFromBackground = true;
      // prefix is passed from background page
      prefix = arguments[1]
    }

    // get data based on prefix
    var obj = SettingsUtils.getCurrentSettings(prefix)

    // transform string to object
    var fvalue = SettingsUtils.removePrefixFromValue(value)

    var obj2 = fvalue

    // create object
    if (_.isString(fvalue)) {
      obj2 = {}
      var arr = fvalue.split('.')
      obj2[arr.pop()] = arg
      while (arr.length > 0) {
        obj2[arr.pop()] = _.clone(obj2)
      }
    }

    // merge
    obj = SettingsUtils.mergeValues(obj, obj2)

    // save in local storage
    localStorage[SettingsUtils.getStorageName(prefix)] = JSON.stringify(obj)

    // Note(hbt): This is necessary because the settings are sent asynchronously and therefore runIt could be initialized before any settings are stored
    // in the localstorage of the site
    if (calledFromBackground && prefix === 'background' && !window.ranCustomJS) {
      window.ranCustomJS = true
      CustomCode.runJS()
    }

    // sync in background storage
    if (typeof syncSettingAllTabs !== "function" && !calledFromBackground) {
      obj = SettingsUtils.transformObject(obj, prefix)
      Post({
        action: "Settings.syncBackgroundStorage",
        arguments: [obj, prefix]
      })
    }
  }

  function get(names) {
    var object = SettingsUtils.getCurrentSettings(names)
    if (!names) return object;

    names = SettingsUtils.removePrefixFromValue(names)
    names = names.split('.');
    while (object && names[0]) {
      object = object[names.shift()];
    }

    return (typeof object == 'undefined') ? '' : object;
  }

  return {
    add: add,
    get: get,
    syncBackgroundStorage: syncBackgroundStorage,
    syncTabStorage: syncTabStorage
  }
})();
