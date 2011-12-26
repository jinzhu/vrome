function parseVromerc(text) {
  var setting     = {};
  setting.imap    = {};
  setting.map     = {};
  setting.cmap    = {};
  setting.set     = {};
  var new_configs = [];

  var configs = text.split("\n");
  for (var i=0; i < configs.length; i++) {
    var config = configs[i].trim();
    var array  = config.split(/\s+/);
    switch (array[0]) {
      case 'imap':
        new_configs.push(config)
        setting.imap[array[1]] = array[2];
        break;
      case 'map':
        new_configs.push(config)
        setting.map[array[1]] = array[2];
        break;
      case 'cmap':
        new_configs.push(config)
        setting.cmap[array[1]] = array[2];
        break;
      case 'set':
        new_configs.push(config)
        var config_left = config.trimFirst(array[0]);
        var setting_key = config_left.split(/\+?=/)[0];
        var setting_value = config_left.trimFirst(setting_key + "=").trimFirst(setting_key + "+=");
        var plus = (config.match(/^\s*set\s+\w+\+=/) ? true : false);
        setting.set[setting_key] = [setting_value, plus];
      break;
      default:
        if (config.match(/^\s*$/)) {
          new_configs.push(config);
        } else {
          new_configs.push(config.replace(/^\/?\/?\s*/, "// "));
        }
    }
  }

  Settings.add({configure: setting});
  return new_configs.join("\n");
}
