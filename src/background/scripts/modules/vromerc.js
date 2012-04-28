var Vromerc = (function() {

  // all tokens related to config here. -- in case we need to change them
  // TODO: refactor existing tokens + make this available via /shared/
  var Tokens = {
    customJSBegin: 'begin_custom_js',
    customJSEnd: 'end_custom_js',
    customCSSBegin: 'begin_custom_css',
    customCSSEnd: 'end_custom_css'
  }

  function parse(text) {
    var res = null;

    var setting = {};
    setting.imap = {};
    setting.map = {};
    setting.cmap = {};
    setting.unmap = {};
    setting.iunmap = {};
    setting.set = {};
    setting.js = {};

    var new_configs = [];

    setting.js = text.extractStringBetweenBlocks(Tokens.customJSBegin, Tokens.customJSEnd);
    setting.css = text.extractStringBetweenBlocks(Tokens.customCSSBegin, Tokens.customCSSEnd);

    var configs = text.split("\n");
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i].trim();
      var array = config.split(/\s+/);
      switch (array[0]) {
      case 'imap':
        new_configs.push(config);
        setting.imap[array[1]] = array[2];
        break;
      case 'map':
        new_configs.push(config);
        setting.map[array[1]] = array[2];
        break;
      case 'cmap':
        new_configs.push(config);
        setting.cmap[array[1]] = array[2];
        break;
      case 'unmap':
        new_configs.push(config);
        setting.unmap[array[1]] = true;
        break;
      case 'iunmap':
        new_configs.push(config);
        setting.iunmap[array[1]] = true;
        break;
      case 'set':
        new_configs.push(config);
        var config_left = config.trimFirst(array[0]);
        var setting_key = config_left.split(/\+?=/)[0];
        var setting_value = config_left.trimFirst(setting_key + "=").trimFirst(setting_key + "+=");
        if (!isNaN(setting_value)) {
          setting_value = Number(setting_value)
        }
        var plus = (config.match(/^\s*set\s+\w+\+=/) ? true : false);

        if (setting_key.startsWith('qm_')) {
          var url_marks = Settings.get('url_marks') || {};
          url_marks[setting_key.replace('qm_', '')] = setting_value
          Settings.add('url_marks', url_marks);
        } else {
          setting.set[setting_key] = [setting_value, plus];
        }
        break;
      default:
        if (config.match(/^\s*$/)) {
          new_configs.push(config);
        } else {
          new_configs.push(config.replace(/^"?\s{0,1}/, "\" "));
        }
      }
    }

    Settings.add({
      configure: setting
    });

    res = new_configs.join("\n");

    res = fixCustomBlocks(res)

    return res;
  }

  // fix custom JS block so it is not in comments

  function fixCustomBlocks(res) {

    _.each(res.extractStringBetweenBlocks(Tokens.customJSBegin, Tokens.customJSEnd, true), function(v) {
      res = res.replace(v, v.split("\n\" ").join("\n"));
    });


    _.each(res.extractStringBetweenBlocks(Tokens.customCSSBegin, Tokens.customCSSEnd, true), function(v) {
      res = res.replace(v, v.split("\n\" ").join("\n"));
    });

    return res;
  }

  function loadAll() {
    loadOnline();
    loadLocal();
  }

  function loadLocal() {
    // local .vromerc file using server
    $.ajax({
      url: getLocalServerUrl()
    }).done(function(data) {

      if (data) {
        var vromerc = "\" Begin Local Vromerc generated\n" + data + "\n\" End Local Vromerc generated\n\n";
        vromerc = vromerc + Settings.get('vromerc').replace(/" Begin Local Vromerc generated\n(.|\n)+\n" End Local Vromerc generated\n?\n?/gm, '');
        Settings.add({
          vromerc: parse(vromerc)
        });
      }
    });
  }

  function loadOnline( /*Boolean*/ scheduleNextReload) {
    var url = Settings.get('onlineVromercUrl');
    if (!url) {
      return false;
    }
    if (!url.match(/^http/)) url = "http://" + url;

    if (scheduleNextReload && Settings.get("onlineVromercReloadInterval")) {
      var interval = Settings.get("onlineVromercReloadInterval") * 1000 * 60;
      setTimeout(function() {
        Vromerc.loadOnline(true);
      }, interval);
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var vromerc = "\" Begin Online Vromerc generated\n" + xhr.responseText + "\n\" End Online Vromerc generated\n\n";
          vromerc = vromerc + Settings.get('vromerc').replace(/" Begin Online Vromerc generated\n(.|\n)+\n" End Online Vromerc generated\n?\n?/gm, '');
          Settings.add({
            vromerc: parse(vromerc)
          });
          Settings.add({
            onlineVromercLastUpdatedAt: new Date().toString()
          });
        }
      }
    };
    xhr.send();
  }

  return {
    parse: parse,
    loadOnline: loadOnline,
    loadAll: loadAll,
    loadLocal: loadLocal
  };
})();
