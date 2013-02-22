class Marks
  addToMark = (setting_key, key, value) ->
    marks = Settings.get(setting_key) or {}
    marks[key] = value
    marks

  @addQuickMark: (msg) ->
    Settings.add url_marks: addToMark("url_marks", msg.key, msg.url)

  @addLocalMark: (msg) ->
    Settings.add local_marks: addToMark("local_marks", msg.key, msg.position)


root = exports ? window
root.Marks = Marks
