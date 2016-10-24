keys =
  Backspace: 'BackSpace'
  Escape: 'Esc'
  ' ': 'Space'

shiftNums =
  '`':  '~'
  '1':  '!'
  '2':  '@'
  '3':  '#'
  '4':  '$'
  '5':  '%'
  '6':  '^'
  '7':  '&'
  '8':  '*'
  '9':  '('
  '0':  ')'
  '-':  '_'
  '=':  '+'
  ';':  ':'
  "'":  '"'
  ',':  '<'
  '.':  '>'
  '/':  '?'
  '\\': '|'

specialKeys = {}
specialKeys[key] = null for key in [
  'Enter', 'Space', 'BackSpace', 'Tab', 'Esc'
  'Left', 'Right', 'Up', 'Down'
  'Home', 'End', 'PageUp', 'PageDown']
specialKeys["F#{key}"] = null for key in [1..12]

window.getKey = (evt) ->
  evt = evt.originalEvent or evt
  return evt.key if isModifierKey evt.key
  return evt.keyCode - 96 if evt.DOM_KEY_LOCATION_NUMPAD is evt.location

  key = keys[evt.key] ? evt.key

  ctrl  = if evt.ctrlKey               then 'C-' else ''
  meta  = if evt.metaKey or evt.altKey then 'M-' else ''
  shift = if evt.shiftKey              then 'S-' else ''

  return "<#{ctrl}#{meta}#{shift}#{key}>" if key of specialKeys

  if evt.shiftKey
    key = key.toUpperCase()
    key = shiftNums[key] if shiftNums[key]

  if ctrl or meta then "<#{ctrl}#{meta}#{key}>" else key
