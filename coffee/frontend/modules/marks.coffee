class Marks
  @addLocalMark: ->
    key = getKey(this)
    setting_key = (if key.match(/^[A-Z]$/) then "@local_marks" else "local_marks")
    local_marks = Settings.get(setting_key) or {}
    local_marks[key] = [scrollX, scrollY, location.href]
    Settings.add setting_key, local_marks
    CmdBox.set title: "Added Local Mark #{key}", timeout: 1000

  @gotoLocalMark: ->
    key = getKey(this)
    setting_key = (if key.match(/^[A-Z]$/) then "@local_marks" else "local_marks")
    position = Settings.get(setting_key)?[key]

    if position instanceof Array
      if key.match(/^[A-Z]$/)
        Post action: "Tab.update", url: position[2], callback: "scrollTo(#{position[0]}, #{position[1]})"
      else
        scrollTo position[0], position[1]
    else
      CmdBox.set title: "Mark #{key} not set", timeout: 1000


  filterQuickMarks = (keyword) ->
    marks = Settings.get("@url_marks") or {}
    cuteMarks = ({title: key, url: mark} for key, mark of marks when key.startsWith(keyword))
    Dialog.draw urls: cuteMarks, keyword: ""

  @addQuickMark: ->
    Dialog.start title: "Add Quick Mark", search: filterQuickMarks, callback: handleAddMark

  @gotoQuickMarkNewTab: => @gotoQuickMark(true)
  @gotoQuickMark: (newtab) -> #Boolean
    title = (if newtab then "Open Quick Mark (new tab)" else "Open Quick Mark")
    Dialog.start title: title, search: filterQuickMarks, newtab: newtab

  @deleteQuickMark: (keyword) ->
    marks = Settings.get("url_marks") or {}
    delete marks[keyword] if marks[keyword]
    Settings.add url_marks: marks

  handleAddMark = (e) ->
    [key, keyword] = [getKey(e), CmdBox.get().content.trim()]
    if isAcceptKey(key)
      Settings.add "@url_marks.#{keyword}", window.location.href
      Dialog.stop true
      CmdBox.set title: "Added Quick Mark #{keyword}", timeout: 2000


root = exports ? window
root.Marks = Marks
