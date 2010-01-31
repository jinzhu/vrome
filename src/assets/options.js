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

function setHotkeyText(hotkeys) {
  var hotkeys_text = '';
  for(var i = 0;i < hotkeys.length; i++) {
    hotkeys_text += hotkeys[i][0] + "\t" + hotkeys[i][1] + "\t\t" + hotkeys[i][2] + "\n";
  }
  $('#hotkeys').val(hotkeys_text.replace(/\n$/,''));
}

function addHotkeyFunctions(fun,value) {
  if (fun.private)     { return; }
  if (fun.insertMode)  {
    addHotkeyFunctions('insertMode',value);
    var select = document.getElementById('hotkey-functions-insertMode');
    select.options[select.options.length] = new Option(value,value);
  }
  if (fun.commandMode) {
    var select = document.getElementById('hotkey-functions-commandMode');
    select.options[select.options.length] = new Option(value,value);
  }
  if (fun.normalMode)  {
    var select = document.getElementById('hotkey-functions-normalMode');
    select.options[select.options.length] = new Option(value,value);
  }
}

function initHotkey() {
  var hotkeys = Settings.get('hotkeys');
  setHotkeyText(hotkeys);

  var modules = ['Buffer','CmdLine','History','Scroll','Search','Zoom','InsertMode','Clipboard','KeyEvent','Tab','CmdBox','Hint','Page','Url','showHelp'];
  for(var i in modules) {
    if (window[modules[i]] instanceof Function) {
      addHotkeyFunctions(window[modules[i]], modules[i])
    } else {
      for(var j in window[modules[i]]) {
        var value = modules[i] + '.' + j;
        addHotkeyFunctions(window[modules[i]][j], value)
      }
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
