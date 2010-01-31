function submitHotkeys(mode) {
  var current_hotkey = document.getElementById('hotkey-keys-' + mode).value + "\t\t" + document.getElementById('hotkey-functions-' + mode).value + "\t\t" + mode;
  var original_value = document.getElementById('hotkeys').value;
  var hotkeys        = (original_value ? (original_value + "\n") : '') + current_hotkey;
  // FIXME duplicate key
  document.getElementById('hotkeys').value = hotkeys;
  saveHotkeys();
}

function saveHotkeys() {
  var hotkeys_text = document.getElementById('hotkeys').value.split("\n");
  var hotkeys      = [];
  for(var i in hotkeys_text) {
    hotkeys.push(hotkeys_text[i].split(/\s+/));
  }
  Settings.add({ hotkeys : hotkeys});
}

function addHotkeyFunctions(mode,value) {
  var select = document.getElementById('hotkey-functions-' + mode);
  select.options[select.options.length] = new Option(value,value);
}

function initHotkey() {
  var hotkeys = Settings.get('hotkeys');
  var hotkeys_text = '';
  for(var i = 0;i < hotkeys.length; i++) {
    hotkeys_text += hotkeys[i][0] + "\t\t" + hotkeys[i][1] + "\t\t" + hotkeys[i][2] + "\n";
  }
  document.getElementById('hotkeys').value = hotkeys_text.replace(/\n$/,'');

  var modules = ['Buffer','CmdLine','History','Scroll','Search','Zoom','InsertMode','Clipboard','KeyEvent','Tab','CmdBox','Hint','Page','Url'];
  for(var i in modules) {
    for(var j in window[modules[i]]) {
      var value = modules[i] + '.' + j;
      if (window[modules[i]][j].private)     { continue; }
      if (window[modules[i]][j].insertMode)  { addHotkeyFunctions('insertMode',value);  }
      if (window[modules[i]][j].commandMode) { addHotkeyFunctions('commandMode',value); }
      if (window[modules[i]][j].normalMode)  { addHotkeyFunctions('normalMode',value);  }
    }
  }
}
// getkey directly from keyboard
