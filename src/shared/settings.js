var Settings = (function() {
  var key = '__vrome_settings';

  var keyMap = {
    'scripts': '__vrome_scripts',
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

    // return prefix if it exists in keyMap and is a valid prefix
    getPrefix: function(value) {
      var res = null
      if (value.indexOf('.') !== -1) {
        var prefix = value.substring(0, value.indexOf('.'))
        res = _.chain(keyMap).keys().contains(prefix).value() ? prefix : null
      }

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
    fixValue: function(value) {
      var res = value
      if (_.isString(value)) {
        // remove prefix if there is one
        var prefix = SettingsUtils.getPrefix(value)
        res = prefix ? value.replace(prefix + '.', '') : value
      } else {
        // do we have at least one key in the Object that's in the map'
        if (_.chain(value).keys().intersection(keyMap).size().value() !== 0) {
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
    }
  }

  /**
   * @value accepts Object{} or Strings (key)
   * @arg value if @value is a string
   */

  function add(value) {
    var arg = _.isString(value) ? arguments[1] : undefined;
    // get data based on prefix
    var obj = SettingsUtils.getCurrentSettings(value)

    // transform string to object
    var fvalue = SettingsUtils.fixValue(value, arg)

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
    localStorage[SettingsUtils.getStorageName(value)] = JSON.stringify(obj)

    // sync in background storage
    // TODO: simplify + refactor into sync function
    //    if (typeof syncSettingAllTabs !== "function") {
    //      Post({
    //          action: "Settings.add",
    //          arguments: obj
    //        })
    //    }
  }

  function get(names) {
    var object = SettingsUtils.getCurrentSettings(names)
    if (!names) return object;

    names = SettingsUtils.fixValue(names)
    names = names.split('.');
    while (object && names[0]) {
      object = object[names.shift()];
    }
    return (typeof object == 'undefined') ? '' : object;
  }

  return {
    add: add,
    get: get
  }
})();
