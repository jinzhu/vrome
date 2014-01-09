class Marks
  @addLocalMark: ->
    key = getKey this
    settingKey = if /^[A-Z]$/.test key then '@local_marks' else 'local_marks'
    localMarks = Settings.get(settingKey) or {}
    localMarks[key] = [scrollX, scrollY, location.href]
    Settings.add settingKey, localMarks
    CmdBox.set title: "Added Local Mark #{key}", timeout: 1000
  desc @addLocalMark, 'Mark position x,y on the page e.g ma'

  @gotoLocalMark: ->
    key = getKey this
    settingKey = if /^[A-Z]$/.test key then '@local_marks' else 'local_marks'
    position = Settings.get(settingKey)?[key]

    if $.isArray position
      if /^[A-Z]$/.test key
        Post action: 'Tab.update', url: position[2], callback: "scrollTo(#{position[0]}, #{position[1]})"
      else
        scrollTo position[0], position[1]
    else
      CmdBox.set title: "Mark #{key} not set", timeout: 1000
  desc @gotoLocalMark, "Go to marked position on the page e.g 'a"

  filterQuickMarks = (newTab) ->
    (keyword) ->
      marks = Settings.get('@url_marks') or {}
      cuteMarks = (title: key, url: mark for key, mark of marks when key.startsWith keyword)
      if cuteMarks.length is 1
        Post action: 'Tab.openUrl', url: cuteMarks[0]['url'], newTab: newTab
      else
        Dialog.draw urls: cuteMarks, keyword: ''

  @addQuickMark: ->
    Dialog.start title: 'Add Quick Mark', search: filterQuickMarks, callback: handleAddMark
  desc @addQuickMark, 'Add new quick mark for current URL'

  @gotoQuickMarkNewTab: => @gotoQuickMark true
  desc @gotoQuickMarkNewTab, 'Same as `go`, but open in new tab (support Dialog extend mode)'

  @gotoQuickMark: (newTab) ->
    title = if newTab then 'Open Quick Mark (new tab)' else 'Open Quick Mark'
    Dialog.start {title, search: filterQuickMarks(newTab), newTab}
  desc @gotoQuickMark, 'Go to quick mark (support Dialog extend mode)'

  @deleteQuickMark: (keyword) ->
    marks = Settings.get('url_marks') or {}
    delete marks[keyword] if marks[keyword]
    Settings.add url_marks: marks

  handleAddMark = (e) ->
    [key, keyword] = [getKey e, CmdBox.get().content.trim()]
    if isAcceptKey(key)
      Settings.add "@url_marks.#{keyword}", window.location.href
      Dialog.stop true
      CmdBox.set title: "Added Quick Mark #{keyword}", timeout: 2000

root = exports ? window
root.Marks = Marks
