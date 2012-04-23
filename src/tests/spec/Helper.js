//simulateKey('U+0046');
//simulateKey('f');
//simulateKey('Down');

function simulateKey(keyChar, control, alt, shift, meta) {
  control = control || false
  alt = alt || false
  shift = shift || false
  meta = meta || false

  var insertMode = /^INPUT|TEXTAREA|SELECT|HTML$/i.test(document.activeElement.nodeName);
  if (insertMode) {
    evt = document.createEvent('TextEvent');
    evt.initTextEvent('textInput', true, true, null, keyChar);
    document.activeElement.dispatchEvent(evt);
  }

  var k = document.createEvent("KeyboardEvent")
  k.initKeyboardEvent("keydown", true, true, null, keyChar, false, control, alt, shift, meta)
  document.activeElement.dispatchEvent(k);


  k = document.createEvent("KeyboardEvent")
  k.initKeyboardEvent("keyup", true, true, null, keyChar, false, control, alt, shift, meta)
  document.activeElement.dispatchEvent(k);

  k = document.createEvent("KeyboardEvent")
  k.initKeyboardEvent("keypress", true, true, null, keyChar, false, control, alt, shift, meta)
  document.activeElement.dispatchEvent(k);
}

function simulateTyping(string) {
  _.each(string.split(''), function(v) {
    simulateKey(v)
  })

}

var c = console;
c.l = console.log;

function getCmd() {
  return $('#_vrome_cmd_input_box');
}

function closeOtherTabs(callback) {
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.query({
      windowId: tab.windowId
    }, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].id != tab.id) {
          chrome.tabs.remove(tabs[i].id);
        }
      }
      return callback.call('', tab);

    });
  })

  return true;

}


// Hack to handle __nested__ asynchronous calls in Jasmine
var Thread = {
  _start: 0,
  _stop: 0,
  start: function() {
    Thread._start = 1;
    Thread._stop = 0
  },
  stop: function() {
    Thread._stop = 1;
  },
  fn: function() {},

  run: function() {
    if (!Thread._start) {
      Thread.start()
      Thread.fn.call('')
    }

    var res = Thread._stop
    if (Thread._stop) {
      Thread.reset()
    }

    return res
  },

  reset: function() {
    Thread._start = 0
    Thread._stop = 0
  }
}

// Notes: Use
// expect(false).toBeTruthy()
// to test if Jasmine didn't interrupt your asynchronous call
