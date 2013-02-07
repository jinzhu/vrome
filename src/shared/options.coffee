Option = (->
  
  # == search
  
  # == global
  
  # used by automated tests
  
  # == autocomplete boxes
  
  # == hint mode
  
  # used to overwrite numbers and use hint string instead
  
  # allows numeric keys to propagate
  
  # == command line
  # shows keys + matches them to commands as you type
  get = (key) ->
    value = (Settings.get("background.configure.set") or Settings.get("configure.set"))[key]
    
    # use default options when testing. Otherwise, the custom config might break the tests
    value = options[key]  if options["test_mode"]
    option = options[key]
    if value instanceof Array
      new_value = value[0]
      plus_it = value[1]
      if option instanceof Array
        if new_value.startsWith("[")
          try
            
            # Note: eval no longer supported in manifest version 2
            #            new_value = eval(new_value);
            # keep message for users with this value
            console.log "Vrome: we no longer support inline [] arrays (new chrome security policy)"
          catch e
            new_value = []
        else
          new_value = [new_value]
        
        # += or =
        option = (if plus_it then option.concat(new_value) else new_value)
      else if option instanceof Object
        try
          new_value = JSON.parse(new_value)
        catch e
          new_value = {}
        if plus_it
          for i of new_value
            option[i] = new_value[i]
        else
          option = new_value
      else
        option = (if plus_it then (option + new_value) else new_value)
    option
  default_search_url = (url) ->
    searchengines = Option.get("searchengines")
    searchengine = searchengines[Option.get("defaultsearch")]
    if searchengine
      url = searchengine.replace("{{keyword}}", url)
    else
      for j of searchengines
        url = searchengines[j].replace("{{keyword}}", url)
        break
    url
  options =
    nextpattern: ["(下|后)一页", "下一頁", "^\\s*Next\\s*$", "^>$", "^More$", "(^(>>|››|»))|((»|››|>>)$)"]
    previouspattern: ["(上|前)一页", "上一頁", "^\\s*Prev(ious)?\\s*$", "^<$", "(^(<<|‹‹|«))|((<<|‹‹|«)$)"]
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
    test_mode: 0
    autocomplete_next: "<Down>"
    autocomplete_prev: "<Up>"
    autocomplete_next_10: "<Tab>"
    autocomplete_prev_10: "<S-Tab>"
    hintkeys: "jlkhfsdagwerui"
    hints_highlight: 1
    useletters: 0
    allow_numeric: 0
    showstatus: 1

  get: get
  default_search_url: default_search_url
  defaultOptions: options
)()
