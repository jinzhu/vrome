var Platform = {
  linux: navigator.userAgent.indexOf("Linux") != -1,
  mac: navigator.userAgent.indexOf("Mac") != -1,
  win: navigator.userAgent.indexOf("Windows") != -1
};

var times = function( /*Boolean*/ raw, /*Boolean*/ read) {
    var count = raw ? KeyEvent.times(read) : (KeyEvent.times(read) || 1);
    return count;
  };

var Post = function(msg) {
    var port = chrome.extension.connect();
    port.postMessage(msg);
  };

function isElementVisible(elem, /* Boolean */ in_full_page) {
  var win_top = window.scrollY / Zoom.current();
  var win_bottom = win_top + window.innerHeight;
  var win_left = window.scrollX / Zoom.current();
  var win_right = win_left + window.innerWidth;

  var pos = elem.getBoundingClientRect();
  var elem_top = win_top + pos.top;
  var elem_bottom = win_top + pos.bottom;
  var elem_left = win_left + pos.left;
  var elem_right = win_left + pos.left;

  var in_current_screen = elem_bottom >= win_top && elem_top <= win_bottom && elem_left <= win_right && elem_right >= win_left;
  var visible_in_screen = (pos.height !== 0 && pos.width !== 0) || (elem.children.length > 0);

  if (in_full_page) {
    return visible_in_screen && isDomElementVisible(elem);
  } else {
    return in_current_screen && visible_in_screen && isDomElementVisible(elem);
  }
}

function isDomElementVisible(obj) {

  if (obj == document) return true

  if (!obj) return false
  if (!obj.parentNode) return false
  if (obj.style) {
    if (obj.style.display == 'none' || obj.style.visibility == 'hidden') return false
  }

  //Try the computed style in a standard way
  var style = null;
  if (window.getComputedStyle) {
    style = window.getComputedStyle(obj, "");
    if (style.display == 'none' || style.visibility == 'hidden') return false
  }

  //Or get the computed style using IE's silly proprietary way
  style = obj.currentStyle;
  if (style && (style['display'] == 'none' || style['visibility'] == 'hidden')) {
    return false
  }

  return isDomElementVisible(obj.parentNode)
}

function clickElement(elem, opt) {
  //event.initMouseEvent(type, canBubble, cancelable, view,
  //                     detail, screenX, screenY, clientX, clientY,
  //                     ctrlKey, altKey, shiftKey, metaKey,
  //                     button, relatedTarget);
  // https://developer.mozilla.org/en/DOM/event.initMouseEvent
  opt = opt || {};
  var new_tab = opt['meta'] || opt['ctrl'];

  // Define method length, then we thought it is an Array
  if (elem.length) {
    for (var i = 0; i < elem.length; i++) {
      if (i > 0) opt['ctrl'] = true;
      clickElement(elem[i], opt);
    }
    return;
  }

  var old_target = null;

  if (!new_tab) {
    old_target = elem.getAttribute('target');
    elem.removeAttribute('target');
  }

  var event = document.createEvent("MouseEvents");
  event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, !! opt.ctrl, !! opt.alt, !! opt.shift, !! opt.meta, 0, null);
  elem.dispatchEvent(event);

  if (old_target) elem.setAttribute('target', old_target);
}

function runIt(func, args) {
  if (func) {
    initFunction.push([func, args]);
  }

  if (document.body) {
    for (var i = 0; i < initFunction.length; i++) {
      var init_function = initFunction[i];

      if (init_function instanceof Function) {
        init_function.call();
      } else if (init_function[0] instanceof Function) {
        init_function[0].apply('', init_function[1]);
      } else {
        Debug("RunIt(Not Run): function" + init_function);
      }
    }

    initFunction = [];
  } else {
    setTimeout(runIt, 10);
  }
}

function loadCustomCSS() {
  try {
    var customCSS = Settings.get('background.configure.css');
    var style = document.createElement('style')
    style.innerHTML = customCSS
    document.getElementsByTagName('head')[0].appendChild(style)
  } catch (e) {
    console.debug("Custom CSS failed to load", e);
  }
}

function runCustomJS() {
  try {
    var customJS = Settings.get('background.configure.js');
    eval(customJS);
    if (typeof frontendExec != "undefined") {
      frontendExec();
    }
  } catch (e) {
    console.debug("Custom JS failed to load", e);
  }
}

function getSelected() {
  return window.getSelection().toString();
}

function showHelp() {
  Post({
    action: "Tab.openUrl",
    url: "https://github.com/jinzhu/vrome/blob/master/Features.mkd#readme",
    newtab: true
  });
}

var Migration = (function() {

  // 1.1.2
  // migrates the data from the local storage to the background local storage
  // necessary so we can export data + sync it across computers


  function migrateData() {
    var data = _.clone(Settings.get());
    delete data['background']
    // transfer the rest to the background localstorage
    if (_.size(data) > 0) {
      _.each(data, function(v, k) {
        var args = {}
        args[k] = v
        Settings.add(args, null, true)
        delete localStorage[k]
      })
    }

  }

  return {
    exec: migrateData
  };
})()
