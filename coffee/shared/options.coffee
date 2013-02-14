class Option
  options =
    nextpattern: ["(下|后)一(页|頁)", "^\\s*Next\\s*$", "^>$", "^More$", "(^(>>|››|»))|((»|››|>>)$)"]
    previouspattern: ["(上|前)一(页|頁)", "^\\s*Prev(ious)?\\s*$", "^<$", "(^(<<|‹‹|«))|((<<|‹‹|«)$)"]
    enable_vrome_key: "<C-Esc>"
    open_tab_on_the_right: 0
    disablesites: ""
    editor: "gvim -f"
    server_port: 20000
    searchengines:
      google: "http://www.google.com/search?q={{keyword}}"
      yahoo: "http://search.yahoo.com/search?p={{keyword}}"
      bing: "http://www.bing.com/search?q={{keyword}}"
      wikipedia: "http://en.wikipedia.org/wiki/{{keyword}}"
      answers: "http://www.answers.com/main/ntquery?s={{keyword}}"
      twitter: "https://twitter.com/search/{{keyword}}"
    defaultsearch: "google"
    autocomplete_next: "<Down>"
    autocomplete_prev: "<Up>"
    autocomplete_next_10: "<Tab>"
    autocomplete_prev_10: "<S-Tab>"
    hintkeys: "jlkhfsdagwerui"
    hints_highlight: 1
    useletters: 0
    allow_numeric: 0
    showstatus: 1

  @get: (key) ->
    configure = Settings.get("configure.set")?[key]
    option = options[key]

    if $.isArray(configure)
      [value, is_plus] = [configure[0], configure[1]]
      if option instanceof Array
        try
          value = (if value.startsWith("[") then JSON.parse(value) else [value])
        catch e
          value = []

        option = (if is_plus then option.concat(value) else value)
      else if $.isPlainObject option
        try
          value = JSON.parse(value)
        catch e
          value = {}

        if is_plus then $.extend(option, value) else option = value
      else
        option = (if is_plus then (option + value) else value)

    option

  @default_search_url: (url) ->
    searchengines = Option.get("searchengines")
    searchengine = searchengines[Option.get("defaultsearch")]
    return searchengine.replace("{{keyword}}", url) if searchengine
    return searchengine.replace("{{keyword}}", url) for searchengine in searchengines
    null #FIXME for CoffeeScriptRedux


root = exports ? window
root.Option = Option
