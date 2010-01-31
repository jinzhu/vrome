function submitHotkeys(mode) {
  var current_hotkey = $('#hotkey-keys-' + mode).val() + "\t\t" + $('#hotkey-functions-' + mode).val() + "\t\t" + mode;
  var original_value = $('#hotkeys').val();
  var hotkeys        = (original_value ? (original_value + "\n") : '') + current_hotkey;
  $('#hotkeys').val(hotkeys);
  saveHotkeys();
}

function saveHotkeys() {
  var hotkeys_text = $('#hotkeys').val().split("\n");
  var hotkeys      = [];
  for(var i in hotkeys_text) {
    if(hotkeys_text[i]) { hotkeys.push(hotkeys_text[i].split(/\s+/)); }
  }
  Settings.add({ hotkeys : hotkeys});
}

function addHotkeyFunctions(mode,value) {
  var select = document.getElementById('hotkey-functions-' + mode);
  select.options[select.options.length] = new Option(value,value);
}

function setHotkeyText(hotkeys) {
  var hotkeys_text = '';
  for(var i = 0;i < hotkeys.length; i++) {
    hotkeys_text += hotkeys[i][0] + "\t" + hotkeys[i][1] + "\t\t" + hotkeys[i][2] + "\n";
  }
  $('#hotkeys').val(hotkeys_text.replace(/\n$/,''));
}

function initHotkey() {
  var hotkeys = Settings.get('hotkeys');
  setHotkeyText(hotkeys);

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
$(document).ready(function() {
  init();
  initHotkey();

  $('#select_default_hotkey').change(function() {
    if (this.value) { setHotkeyText(window[this.value]); }
    saveHotkeys();
  });
});
