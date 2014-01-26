class window.Clipboard
  @copy: (value) ->
    Post action: 'Clipboard.copy', value: value
