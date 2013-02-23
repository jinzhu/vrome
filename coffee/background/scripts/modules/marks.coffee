class Marks
  addToMark = (setting_key, key, value) ->
    marks = Settings.get(setting_key) or {}
    marks[key] = value
    marks

  @addQuickMark: (msg) ->
    Settings.add url_marks: addToMark("url_marks", msg.key, msg.url)


root = exports ? window
root.Marks = Marks
