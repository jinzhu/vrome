class Marks
  addQuickMark = ->
    marks = Settings.get("url_marks") or {}
    Dialog.start "Add Quick Mark", "", filterQuickMarks, false, handleEnterKey
  filterQuickMarks = (string) ->
    sortedKeys = getFilteredMarks(string)
    
    # create data for dialog
    cuteMarks = []
    _.each sortedKeys, (k) ->
      cuteMarks.push
        title: k
        url: marks[k]


    Dialog.draw
      urls: cuteMarks
      keyword: ""

  getFilteredMarks = (keyword) ->
    
    # marks starting by input
    sortedKeys = _.filter(_.keys(marks), (k) ->
      k.startsWith keyword
    )
    sortedKeys.sort()
  handleEnterKey = (e) ->
    key = getKey(e)
    keyword = CmdBox.get().content
    if isAcceptKey(key)
      
      # marks starting by input
      sortedKeys = getFilteredMarks(keyword)
      
      # allow overwrite if it is the same mark
      if sortedKeys.length > 0 and (sortedKeys.length isnt 1 and sortedKeys[0] isnt keyword)
        
        # prevent the user from shooting himself in the foot and creating marks that he can't access
        CmdBox.set title: "Conflict detected. Can't set mark `" + keyword + "` without blocking other marks"
      else
        Post
          action: "Marks.addQuickMark"
          key: keyword
          url: window.location.href

        Dialog.stop true
        CmdBox.set
          title: "Added Quick Mark " + keyword
          timeout: 2000

      return true
    false
  gotoQuickMark = (newtab) -> #Boolean
    marks = Settings.get("background.url_marks") or {}
    gotoNewTab = newtab
    title = (if gotoNewTab then "Open Quick Mark (new tab)" else "Open Quick Mark")
    Dialog.start title, "", filterQuickMarks, newtab, handleGotoKeydown
  handleGotoKeydown = (e) ->
    key = getKey(e)
    keyword = CmdBox.get().content
    sortedKeys = getFilteredMarks(keyword)
    if keyword.length > 0 and (isCtrlAcceptKey(key) or isAcceptKey(key) or sortedKeys.length is 1)
      new_tab = gotoNewTab
      Dialog.stop true
      
      # limit to one mark unless it's control key then open all matches in new tabs
      if isCtrlAcceptKey(key)
        new_tab = sortedKeys.length > 1
      else
        sortedKeys = [sortedKeys[0]]
      
      # open marks
      _.each sortedKeys, (k) ->
        value = marks[k]
        if value.startsWith("::javascript::")
          try
            eval_ value.replace("::javascript::", "")
          catch e
            console.debug "failed to execute JS quick mark " + keyword, e
        else
          Post
            action: "Tab.openUrl"
            urls: value
            newtab: new_tab


      return true
    false
  addLocalMark = ->
    
    # TODO zoom
    key = getKey(this)
    if key.match(/^[A-Z]$/)
      Post
        action: "Marks.addLocalMark"
        key: key
        position: [scrollX, scrollY, location.href]

    else
      local_marks = Settings.get("hosts.local_marks") or {}
      local_marks[key] = [scrollX, scrollY]
      Settings.add "hosts.local_marks", local_marks
    CmdBox.set
      title: "Added Local Mark " + key
      timeout: 1000

  gotoLocalMark = ->
    key = getKey(this)
    setting_key = (if key.match(/^[A-Z]$/) then "background.local_marks" else "hosts.local_marks")
    position = (if key.match(/^[A-Z]$/) then Settings.get(setting_key)[key] else Settings.get(setting_key, true)[key])
    if position instanceof Array
      if position[2]
        Post
          action: "Tab.update"
          url: position[2]
          callback: "scrollTo(" + position[0] + "," + position[1] + ")"

      else
        scrollTo position[0], position[1]
  deleteQuickMark = (keyword) ->
    marks = Settings.get("url_marks") or {}
    if marks[keyword]
      delete marks[keyword]

      Settings.add "url_marks", marks
  gotoNewTab = false
  marks = undefined
  addQuickMark: addQuickMark
  gotoQuickMark: gotoQuickMark
  gotoQuickMarkNewTab: ->
    gotoQuickMark.call this, true

  addLocalMark: addLocalMark
  gotoLocalMark: gotoLocalMark
  deleteQuickMark: deleteQuickMark
)()


root = exports ? window
root.Marks = Marks
