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
    return visible_in_screen && isDomElementVisible(elem)
  } else {
    return in_current_screen && visible_in_screen && isDomElementVisible(elem)
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

// attempts to do what isDomElementVisible supposed to do but limited to help box overlay for now

function isHiddenByOverlay(elem) {
  if (!elem) return false

  var overlay = document.getElementById('vromeHelpOverlay')

  if (overlay) {
    var rect = elem.getBoundingClientRect()
    var x = rect.left + (rect.width / 2)
    var y = rect.top + (rect.height / 2)

    var e = document.elementFromPoint(x, y)
    if (e == elem) return true
    else return false
  }

  return true
}

// idea to check overlay e.g when help box over shows over links, we don't display hints for links we can't access
// unfortunately document.elementFromPoint is not very reliable
// TODO: come up with a better idea. the goal is for elements with a lower z-index to not have hints

function isDomElementHidden(obj) {
  if (!obj) return false

  var rect = obj.getBoundingClientRect()
  var padding = 200
  var x = rect.left + (rect.width / 2)
  var y = rect.top + (rect.height / 2)


  var elem = document.elementFromPoint(x, y)
  if (!elem) return false

  if (elem == obj) return true
  if (elem.parentNode && elem.parentNode == obj) return true
  if (elem.firstChild && elem.firstChild == obj) return true

  for (var i = 0; i < elem.children.length; i++)
  if (elem[i] == obj) return true;

  i = 0
  while (i < 10) {
    var rectElem = elem.getBoundingClientRect()
    if (rectElem.top < rect.top + padding && rectElem.left < rect.left + padding && elem.parentNode && elem != document.body && elem != document) {
      if (elem.parentNode == obj) return true;
    } else {
      break;
    }

    elem = elem.parentNode
    i++;
  }

  return false;
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

// accept function or array of functions

function runIt(func, args) {
  var initFunction = []

  if (_.isArray(func)) {
    initFunction = func
  } else if (_.isFunction(func)) {
    initFunction.push([func, args]);
  }

  $(document).ready(function() {
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
  })
}

var CustomCode = (function() {

  function loadCSS() {
    try {
      var customCSS = Settings.get('background.configure.css');
      var style = document.createElement('style')
      style.innerHTML = customCSS
      document.getElementsByTagName('head')[0].appendChild(style)
    } catch (e) {
      console.debug("Custom CSS failed to load", e);
    }
  }

  function runJS() {
    try {
      var customJS = Settings.get('configure.js');
      if (customJS) {
        eval(customJS);
        if (typeof frontendExec != "undefined") {
          frontendExec();
        }
      }
    } catch (e) {
      console.debug("Custom JS failed to load", e);
    }
  }

  return {
    loadCSS: loadCSS,
    runJS: runJS
  }
})()


function getSelected() {
    return window.getSelection().toString();
  }

var Migration = (function() {

  // 1.1.2
  // migrates the data from the local storage to the background local storage
  // necessary so we can export data + sync it across computers

  function migrateData() {
    try {
      var data = JSON.parse(localStorage['__vrome_setting'] || "{}")
      // add if we don't already have data'
      if (data) {
        !Settings.get('hosts.zoom_level') && data['zoom_level'] && Settings.add('hosts.zoom_level', data['zoom_level']);
        !Settings.get('hosts.local_marks') && data['local_marks'] && Settings.add('hosts.local_marks', data['local_marks']);
        delete localStorage['__vrome_setting']
      }
    } catch (e) {
      c.l(e)
    }
  }

  return {
    exec: migrateData
  };
})()


var Dropbox = {
  isAuthorized: function() {
    if (!window.location.href.startsWith("https://www.dropbox.com/1/oauth/authorize")) {
      return;
    }

    var i;
    var forms = document.getElementsByTagName("form");
    for (i in forms) {
      // Check inquiry page.
      var form = forms[i];
      if (form.action && form.action.match(/\/authorize$/)) {
        console.log("Skip inquiry page.");
        return;
      }
    }
    var auth = document.getElementById("auth");
    if (!auth) {
      console.log("#auth part not found.");
      return;
    }
    auth = auth.innerText;
    var successMessage = "Success!";
    var scripts = document.getElementsByTagName("script");
    for (i in scripts) {
      var script = scripts[i].innerText;
      if (!script) continue;
      var matched = script.match(/"Success!":[^}]*"t":\s*"([^"]*)"/);
      if (!matched) continue;
      successMessage = unescape(matched[1].replace(/\\u/g, "%u"));
      console.log("i18n message found: " + successMessage);
      break;
    }
    if (auth.indexOf(successMessage) >= 0) {
      console.log("Success! found.");
      chrome.extension.sendRequest({
        isSuccess: true
      });
    }
  }
}


//http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string

function extractFunction(functionName, context /*, args */ ) {
  var args = Array.prototype.slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for (var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func];
  // exec
  //  return context[func].apply(this, args);
}
