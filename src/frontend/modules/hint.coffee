class Hint
  [currentHint, new_tab, multi_mode, hintMode, selected, elements, matched, key, clickedElems, isStringMode, hintKeys, subMatched, dupElements] = []
  [highlight, highlight_id] = ["vrome_highlight", "vrome_highlight"]

  @new_tab_start: => @start true
  @multi_mode_start: => @start true, true #new tab, #multi mode
  @start_string: => @start false, false, true
  @new_tab_start_string: => @start true, false, true
  @multi_mode_start_string: -> @start true, true, true
  @start: (newTab, multiMode, stringMode, prevContent) ->
    Hint.remove()
    [hintMode, new_tab, multi_mode, isStringMode] = [true, newTab, multiMode, stringMode or (Option.get("useletters") is 1)]
    [hintKeys] = [Option.get("hintkeys")]
    initHintMode()

    if isStringMode
      CmdBox.set {title: "HintMode", pressUp: handleInput, content: prevContent ? "", noHighlight: inRepeatMode(prevContent), stopAllPropagation: true}
    else
      CmdBox.set title: "HintMode", pressDown: handleInput, content: ""

  @remove: ->
    return false unless hintMode
    CmdBox.remove()
    removeHighlightBox()
    hintMode = false


  initHintMode = ->
    [selected, currentHint, clickedElems, subMatched, elements, matched, dupElements] = [0, false, [], [], [], [], {}]
    # Get all visible elements
    elements = $("a,input:not([type=hidden]),textarea,select,button,*[onclick]").has(':visible').not("#_vrome_cmd_input_box")
    setHintIndex elements
    matched = elements

  removeHighlightBox = (create_after_remove) -> # Boolean
    $(elements).find("[#{highlight_id}]").removeAttr(highlight_id)
    $("#__vim_hint_highlight").remove()
    $("body").append $("<div>", id: "__vim_hint_highlight") if create_after_remove
    $("#__vim_hint_highlight")


  setHintIndex = (elems) ->
    div = removeHighlightBox(true) # create_after_remove
    [currentString, hintStrings] = [getCurrentString(), null]

    if isStringMode
      # index of similar links so we generate the same hints for duplicates
      hintStrings = StringModeHelper.hintStrings(elems)
      subMatched = []

    for elem, i in elems
      span = $("<span>", style: "left:#{$(elem).left()}px;top:#{$(elem).top()}px;background-color:red;")
      if isStringMode
        mnemonic = StringModeHelper.updateMnemonic(hintStrings[i], currentString)
        continue if mnemonic.length is 0 # do not add to frag if empty
        span.innerHTML = mnemonic
      else
        span.innerHTML = i + 1 # set number for available elements

      setHighlight elem, false # set_active
      $(div).append span

    setHighlight elems[0], true  if elems[0] and elems[0].tagName is "A" # set_active


  setHighlight = (elem, set_active) ->
    return false unless elem
    if set_active
      # Remove the old active element
      $("a[#{highlight_id}=hint_active]").attr highlight_id, "hint_elem"
      $(elem).attr highlight_id, "hint_active"
    else
      $(elem).attr highlight_id, "hint_elem"


  @getCurrentString = ->
    $.trim CmdBox.get().content


  getMatchedElementsByString = (str) ->
    str = str.toLowerCase()
    newMatched = []
    dupKeys = _.map(_.keys(dupElements), (v) ->
      parseInt v
    )
    i = 0

    while i < subMatched.length
      mnemonic = subMatched[i]

      # don't push the duplicates
      newMatched.push elements[i]  if mnemonic.startsWith(str) and _.include(dupKeys, i) is false
      i++
    newMatched
  handleInput = (e) ->
    key = getKey(e)
    exec = false

    # If user are inputing number
    if /^\d$/.test(key) or (key is "<BackSpace>" and selected isnt 0)
      selected = (if (key is "<BackSpace>") then parseInt(selected / 10) else selected * 10 + Number(key))
      CmdBox.set title: "HintMode (" + selected + ")"
      index = selected - 1
      currentHint = matched[index]
      setHighlight matched[index], true # set_active
      e.stopPropagation()
      e.preventDefault()
      exec = true  if selected * 10 > matched.length
    else if isStringMode
      if getCurrentAction() is "search"
        setTimeout delayToWaitKeyDown, 20
      else
        newMatched = getMatchedElementsByString(getCurrentString())
        setHintIndex elements
        currentHint = newMatched[0]
        exec = true  if newMatched.length is 1
    else

      # If key is not Accept key, Reset title
      CmdBox.set title: "HintMode"  unless isAcceptKey(key)

      # If key is not Escape key, Reset hints
      setTimeout delayToWaitKeyDown, 20  unless isEscapeKey(key)
    if exec
      e.stopPropagation()
      e.preventDefault()
      return execSelect(currentHint)
    false
  hintMatch = (elem, index) ->
    text = elem.innerText
    filter = CmdBox.get().content.trimFirst(getCurrentActionNames())
    filter = getCurrentString()  if isStringMode and getCurrentAction() is "search"
    regexp = new RegExp(filter.trimFirst("!"), "im")
    result = regexp.test(text) or regexp.test(PinYin.shortcut(text)) or regexp.test(PinYin.full(text))
    (if filter.startsWith("!") then not result else result)
  getCurrentActionNames = ->
    names = _.keys(subActions)
    aliases = (Option.get("hint_actions") and JSON.parse(Option.get("hint_actions"))) or []
    names = _.uniq(_.union(_.keys(aliases), names))
    names
  getCurrentAction = (content) ->
    filter = content or CmdBox.get().content
    actionName = filter.substring(0, 1)

    # get the alias associated to this action e.g use @ instead of [
    aliases = Option.get("hint_actions") and JSON.parse(Option.get("hint_actions"))
    actionName = (aliases and aliases[actionName]) or actionName
    subActions[actionName]
  showElementInfo = (elem) ->
    CmdBox.set title: elem.outerHTML
  focusElement = (elem) ->
    elem.focus()
  copyElementUrl = (elem) ->
    text = Url.fixRelativePath(elem.getAttribute("href"))
    Clipboard.copy text
    CmdBox.set
      title: "[Copied] " + text
      timeout: 4000

  openUrlIncognito = (elem) ->
    new_tab = true
    execSelect elem
    CancelKeyFunction()
    CmdBox.set
      title: "Opened URL into incognito window"
      timeout: 3000

    Post {}
    Post action: "Tab.makeLastTabIncognito"
  copyElementText = (elem) ->
    text = elem.innerText or elem.value
    if text
      Clipboard.copy text
      CmdBox.set
        title: "[Copied] " + text
        timeout: 4000

  delayToWaitKeyDown = ->
    selected = 0
    matched = []
    i = 0
    j = elements.length

    while i < j
      matched.push elements[i]  if hintMatch(elements[i], i)
      i++
    setHintIndex matched
    if isCtrlAcceptKey(key)
      i = 0
      j = matched.length

      while i < j
        execSelect matched[i]
        new_tab = true
        i++
    else execSelect (if currentHint then currentHint else matched[0])  if isAcceptKey(key) or matched.length is 1
    currentHint = false
  execSelect = (elem) ->
    return false  if not elem or (elem and _.include(clickedElems, elem))
    currentAction = getCurrentAction()
    tag_name = elem.tagName.toLowerCase()
    type = (if elem.type then elem.type.toLowerCase() else "")
    if currentAction and _.isFunction(currentAction)
      remove() # No multi_mode for extend mode
      currentAction elem
    else
      if tag_name is "a"
        setHighlight elem, true
        options = {}
        options[(if Platform.mac then "meta" else "ctrl")] = new_tab
        clickElement elem, options
      else if tag_name is "input" or tag_name is "textarea"
        try
          elem.selectionEnd # this will trigger an error for checkboxes and other non text elements and therefore trigger a click instead
          elem.focus()
          elem.setSelectionRange elem.value.length, elem.value.length
        catch e
          clickElement elem # some website don't use standard submit input.
      else if elem.onclick or (tag_name is "input" and (type is "submit" or type is "button" or type is "reset" or type is "radio" or type is "checkbox")) or tag_name is "button"
        clickElement elem
      else elem.focus()  if tag_name is "select"
      clickedElems.push elem
      oldContent = getCurrentString()
      if isStringMode and (inRepeatMode(oldContent))

        # repeat if the first character is uppercase or we are in multi mode
        repeatHintMode()
      else if multi_mode and not isStringMode
        selected = 0
        CmdBox.set title: "HintMode"
      else
        setTimeout remove, 200
    true
  inRepeatMode = (currentString) ->
    currentString = getCurrentString()  unless currentString
    (new_tab and currentString.charAt(0).isUpperCase()) or multi_mode
  repeatHintMode = ->
    currentString = getCurrentString()
    CancelKeyFunction()
    res = _.select(currentString.split(""), (v) ->
      v.isUpperCase()
    ).join("")
    start true, multi_mode, true, res
    getMatchedElementsByString res
    setHintIndex elements
  isExperimental = ->

    # runs experimental code. not yet 100% stable for production
    # code using isExperimental can be easily refactored later on
    hintKeys.indexOf(",") isnt -1
  subActions =
    ";": focusElement
    "?": showElementInfo
    "[": copyElementUrl
    "{": copyElementText
    "\\": openUrlIncognito
    "/": "search"

  StringModeHelper =
    getDuplicatedElements: (elems) ->
      res = {}
      hrefs = {}
      i = 0
      j = elems.length

      while i < j
        elem = elems[i]
        if elem and elem.tagName is "A"
          href = elem.href or ""
          continue  unless href.isValidURL()

          # same link found
          if hrefs[href] isnt `undefined`
            oriElem = elements[hrefs[href]]

            # same onclick code + same event listeners. This is the exact same element. Use same hints
            res[i] = hrefs[href]  if oriElem and oriElem.onclick is elem.onclick
          else
            hrefs[href] = i
        i++
      res

    logXOfBase: (x, base) ->
      Math.log(x) / Math.log(base)


    #
    #     * Returns a list of hint strings which will uniquely identify the given number of links. The hint strings
    #     * may be of different lengths.
    #
    hintStrings: (elems) ->
      linkCount = elems.length
      linkHintCharacters = hintKeys

      # provided two sets of hint keys e.g dsafrewq,tgcx  We try to use the first for combinations as much as possible
      # second set is for keys that are too far away but necessary to avoid 3 letters combinations
      unless hintKeys.indexOf(",") is -1
        arrhintKeys = hintKeys.split(",")
        if linkCount <= arrhintKeys[0].length
          linkHintCharacters = arrhintKeys[0]
        else
          linkHintCharacters = arrhintKeys[1] + arrhintKeys[0]

      # Determine how many digits the link hints will require in the worst case. Usually we do not need
      # all of these digits for every link single hint, so we can show shorter hints for a few of the links.
      digitsNeeded = Math.ceil(@logXOfBase(linkCount, linkHintCharacters.length))

      # Short hints are the number of hints we can possibly show which are (digitsNeeded - 1) digits in length.
      shortHintCount = Math.floor((Math.pow(linkHintCharacters.length, digitsNeeded) - linkCount) / linkHintCharacters.length)
      longHintCount = linkCount - shortHintCount
      hintStrings = []
      if digitsNeeded > 1
        i = 0

        while i < shortHintCount
          hintStrings.push @numberToHintString(i, digitsNeeded - 1, linkHintCharacters)
          i++
      start = shortHintCount * linkHintCharacters.length
      i = start
      while i < start + longHintCount
        hintStrings.push @numberToHintString(i, digitsNeeded, linkHintCharacters)
        i++
      dupElements = StringModeHelper.getDuplicatedElements(elems)
      hintStrings = @sortBySimilarity(hintStrings, elems)  if multi_mode
      hintStrings = @fixDuplicates(hintStrings)
      hintStrings

    getSimilarityScore: (str1, str2) ->
      return null  if not str1 or not str2 or str1 is "" or str2 is ""
      strl = null
      strs = null

      # find long + short string
      if str1.length >= str2.length
        strl = str1
        strs = str2
      else
        strl = str2
        strs = str1
      nbInvalids = 0
      matches = {}
      i = 0

      while i < strl.length
        strlc = strl.charAt(i)
        start = 0
        start = matches[strlc]  if matches[strlc]
        posi = strs.indexOf(strlc, start)
        nbInvalids++  if posi is -1
        i++
      score = (strs.length - nbInvalids) / strl.length * 100
      score

    buildSimilarityIndex: (elems) ->
      maxScore = 70
      index = {}

      # loop through elements + group them by similarity
      _.each elems, (v, k) ->
        pushed = false
        _.each index, (iv, ik) ->
          return  if pushed or v.tagName isnt elems[ik].tagName
          score1 = 0
          if v.tagName is "A"
            score1 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].getAttribute("href"), v.getAttribute("href")))
            score2 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].innerText, v.innerText))
            score1 = (score1 + score2) / 2  if score2 > maxScore
          else
            score1 = parseInt(StringModeHelper.getSimilarityScore(elems[ik].outerHTML, v.outerHTML))
          if score1 > maxScore
            index[ik].push k
            pushed = true

        index[k] = []


      # remove empty ones from index -- no similar matches
      _.each index, (v, k) ->
        delete index[k]  if v.length is 0


      # merge similar groups + close matches
      _.each index, (v, k) ->
        i = 0

        while i < v.length
          id = v[i]
          if index[id]
            v.push index[id]
            delete index[id]
          else
            _.each index, (v2, k2) ->
              if k2 isnt k and _.include(v2, id)
                v.push index[k2]
                v.push k2
                delete index[k2]

          i++


      # flatten it + make them unique
      _.each index, (v, k) ->
        index[k] = _.unique(_.flatten(v))
        index[k].push parseInt(k)

      index


    # sort elements by a similarity score and assigns hints starting by the same letter
    # e.g links like "comments (20)", "comments (50)", "comments (55)" will start by the same letter e.g S
    # this way the user can open multiple links highly related very quickly
    sortBySimilarity: (hintStrings, elems) ->
      index = @buildSimilarityIndex(elems)

      # create an index matching the new keys to the elements
      if _.size(index) > 0
        hindex = {}
        usedLetters = []
        done = false
        until done
          done = true
          ids = _.max(index, (v) ->
            v.length
          )
          if ids isnt `undefined`
            lastHs = null
            _.each hintStrings, (hs, hsk) ->
              if hs.length > 1 and not _.include(usedLetters, hs.charAt(0)) and not _.include(_.values(hindex), hsk) and ids.length > 0
                id = _.first(ids)
                hindex[parseInt(id)] = parseInt(hsk)
                delete index[id]

                ids.shift()
                lastHs = hs
                done = false

            usedLetters.push lastHs.charAt(0)  if lastHs

        # rebuild the hint strings using the new matches
        hs = {}
        newhs = []
        _.each hindex, (v, k) ->
          hs[k] = hintStrings[v]


        # add whatever is left
        remaining = _.difference(hintStrings, _.values(hs))
        _.times hintStrings.length, (k) ->
          hs[k] = remaining.shift()  if hs[k] is `undefined`

        _.times _.size(hs), (k) ->
          newhs.push hs[k]

        hintStrings = newhs
      hintStrings

    fixDuplicates: (hintStrings) ->

      # remove any duplicates
      _.map hintStrings, (v, k) ->
        if dupElements[k] isnt `undefined`
          hintStrings[dupElements[k]]
        else
          hintStrings[k]



    #
    #     * This shuffles the given set of hints so that they're scattered -- hints starting with the same character
    #     * will be spread evenly throughout the array.
    #
    shuffleHints: (hints, characterSetLength) ->
      buckets = []
      i = 0
      i = 0
      while i < characterSetLength
        buckets[i] = []
        i++
      i = 0
      while i < hints.length
        buckets[i % buckets.length].push hints[i]
        i++
      result = []
      i = 0
      while i < buckets.length
        result = result.concat(buckets[i])
        i++
      result


    #
    #     * Converts a number like "8" into a hint string like "JK". This is used to sequentially generate all of
    #     * the hint text. The hint string will be "padded with zeroes" to ensure its length is equal to numHintDigits.
    #
    numberToHintString: (number, numHintDigits, characterSet) ->
      base = characterSet.length
      hintString = []
      remainder = 0
      loop
        remainder = number % base
        hintString.unshift characterSet[remainder]
        number -= remainder
        number /= Math.floor(base)
        break unless number > 0

      # Pad the hint string we're returning so that it matches numHintDigits.
      # Note: the loop body changes hintString.length, so the original length must be cached!
      hintStringLength = hintString.length
      i = 0

      while i < numHintDigits - hintStringLength
        hintString.unshift characterSet[0]
        i++
      hintString.join ""

    updateMnemonic: (mnemonic, currentString) ->
      if currentString isnt null and currentString.length > 0
        currentString = currentString.toLowerCase()
        if mnemonic.startsWith(currentString)
          mnemonic = mnemonic.replace(currentString, "")
        else
          mnemonic = ""
      mnemonic


root = exports ? window
root.Hint = Hint
