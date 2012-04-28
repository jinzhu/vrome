var Settings = (function() {
  var key = '__vrome_setting';

  function extend(to, from) {
    if (!to) {
      to = {};
    }
    for (var p in from) {
      to[p] = from[p];
    }
    return to;
  }

  function currentSetting() {
    try {
      return JSON.parse(localStorage[key] || "{}");
    } catch (e) {
      localStorage[key] = "{}"
      return {};
    }
  }

  function add(object, val, perHost) {
    var res = null;
    if (perHost === true && object instanceof Object) {

      // add this property to the background localstorage
      var args = currentSetting()
      args = args['background'] || args
      args['hosts'] = args['hosts'] || {}
      var hostname = getHostname()
      args["hosts"][hostname] = args["hosts"][hostname] || {}
      _.each(_.keys(object), function(k) {
        if (_.isObject(object[k])) {
          args["hosts"][hostname][k] = _.extend(args["hosts"][hostname][k] || {}, object[k])
        } else {
          args["hosts"][hostname][k] = object[k]
        }
      })

      // send it to background localstorage
      Post({
        action: "Settings.add",
        arguments: args
      })

      // save it locally too
      localStorage[key] = JSON.stringify({
        background: args
      })
    } else if (object instanceof Object) {
      object = extend(currentSetting(), object);
      localStorage[key] = JSON.stringify(object);
      res = object
    } else {
      var name = arguments[0];
      var value = arguments[1];
      var old_object = object = currentSetting();
      name = name.split('.');
      while (name.length > 1) {
        object = object[name.shift()];
      }
      object[name.shift()] = value;
      localStorage[key] = JSON.stringify(old_object);
      res = old_object
    }

    return res;
  }

  function get(names, perHost) {
    var object = currentSetting();
    if (perHost === true) {
      try {
        object = object["background"]["hosts"][getHostname()] || {}
      } catch (e) {}
    }
    if (!names) return object;

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
