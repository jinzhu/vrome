class Clipboard
  @copy: (value) ->
    Post action: "Clipboard.copy", value: value


root = exports ? window
root.Buffer = Buffer
