Marks = (->
  addQuickMark = (msg) ->
    url_marks = Settings.get("url_marks") or {}
    url_marks[msg.key] = msg.url
    Settings.add "url_marks", url_marks
    syncSetting Tab.now_tab
  addLocalMark = (msg) ->
    local_marks = Settings.get("local_marks") or {}
    local_marks[msg.key] = msg.position
    Settings.add "local_marks", local_marks
    syncSetting Tab.now_tab
  addQuickMark: addQuickMark
  addLocalMark: addLocalMark
)()
