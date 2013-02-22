class Marks
  addToMark = (setting_key, key, value) ->
    marks = Settings.get(setting_key) or {}
    marks[key] = value
    Settings.add setting_key, marks

  @addQuickMark: (msg) ->
    addToMark("url_marks", msg.key, msg.url)

  @addLocalMark: (msg) ->
    addToMark("local_marks", msg.key, msg.position)


root = exports ? window
root.Marks = Marks
