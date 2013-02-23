class Marks
  [gotoNewTab, marks] = [false, {}]

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


  @addQuickMark: ->
    marks = Settings.get("url_marks") or {}
    Dialog.start title: "Add Quick Mark", search: filterQuickMarks, callback: handleEnterKey

  @gotoQuickMarkNewTab: => @gotoQuickMark.call this, true

  @gotoQuickMark: (newtab) -> #Boolean
    marks = Settings.get("background.url_marks") or {}
    title = (if newtab then "Open Quick Mark (new tab)" else "Open Quick Mark")
    Dialog.start title: title, search: filterQuickMarks, newtab: newtab, callback: handleGotoKeydown

  @deleteQuickMark: (keyword) ->
    marks = Settings.get("url_marks") or {}
    delete marks[keyword] if marks[keyword]
    Settings.add url_marks: marks


  getFilteredMarks = (keyword) ->
    ([mark, key] for mark, key in marks when key.startsWith(keyword)).sort()


  filterQuickMarks = (string) ->
    cuteMarks = {title: key, url: mark} for mark, key in getFilteredMarks(string)
    Dialog.draw urls: cuteMarks, keyword: ""


  handleEnterKey = (e) ->
    [key, keyword] = [getKey(e), CmdBox.get().content]

    if isAcceptKey(key)
      # marks starting by input
      filterMarks = getFilteredMarks(keyword)

      # allow overwrite if it is the same mark
      if filterMarks.length > 0 and (filterMarks.length isnt 1 and filterMarks[1] isnt keyword)
        # prevent the user from shooting himself in the foot and creating marks that he can't access
        CmdBox.set title: "Conflict detected. Can't set mark `" + keyword + "` without blocking other marks"
      else
        Post action: "Marks.addQuickMark", key: keyword, url: window.location.href
        Dialog.stop true
        CmdBox.set title: "Added Quick Mark #{keyword}", timeout: 2000


  handleGotoKeydown = (e) ->
    [key, keyword] = [getKey(e), CmdBox.get().content]

    filterMarks = getFilteredMarks(keyword)
    if keyword.length > 0 and (isCtrlAcceptKey(key) or isAcceptKey(key) or filterMarks.length is 1)
      new_tab = gotoNewTab || (isCtrlAcceptKey(key) && (filterMarks.length > 1))
      Dialog.stop true

      for value, key in filterMarks
        if value.startsWith("::javascript::")
          try
            eval value.replace("::javascript::", "")
          catch e
            console.debug "failed to execute JS quick mark " + keyword, e
        else
          Post action: "Tab.openUrl", urls: value, newtab: new_tab


root = exports ? window
root.Marks = Marks
