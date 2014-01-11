class Option
  googleSearch = 'http://www.google.com/search?q={{keyword}}'

  options =
    nextpattern: ['(下|后)一?(页|頁|篇|张)', '^\\s*Next\\s*$', '^>$', '^More$', '(^(>>|››|»)\\|?)|((»|››|>>)\\|?$)']
    previouspattern: ['(上|前)一(页|頁|篇|张)', '^\\s*Prev(ious)?\\s*$', '^<$', '(^(<<|‹‹|«)\\|?)|((<<|‹‹|«)\\|?$)']
    enable_vrome_key: '<C-Esc>'
    disablesites: ''
    editor: 'gvim -f'
    server_port: 20000
    searchengines:
      google:    googleSearch
      yahoo:     'http://search.yahoo.com/search?p={{keyword}}'
      bing:      'http://www.bing.com/search?q={{keyword}}'
      wikipedia: 'http://en.wikipedia.org/wiki/{{keyword}}'
      answers:   'http://www.answers.com/main/ntquery?s={{keyword}}'
      twitter:   'https://twitter.com/search/{{keyword}}'
    defaultsearch: 'google'
    autocomplete_next:    '<Down>'
    autocomplete_prev:    '<Up>'
    autocomplete_next_10: '<Tab>'
    autocomplete_prev_10: '<S-Tab>'
    hintkeys: 'asdfghjklqwertyuiopzxcvbnm'
    useletters: 1
    showstatus: 1
    show_disabled_text: 1
    follow_new_tab: 1
    completion_items: 'url,search-engine,bookmarks,history,search'
    sources_map:
      jquery: 'http://code.jquery.com/jquery.js'

  @get: (key) ->
    configure = Settings.get('@configure.set')?[key]
    option = options[key]

    if $.isArray configure
      [value, isPlus] = configure
      if $.isArray option
        try
          value = if value.startsWith '[' then JSON.parse value else [value]
        catch e
          value = []

        option = if isPlus then option.concat value else value
      else if $.isPlainObject option
        try
          value = JSON.parse value
        catch e
          value = {}

        if isPlus then $.extend option, value else option = value
      else
        option = if isPlus then option + value else value

    option

  @defaultSearchUrl: (url) ->
    searchengines = Option.get 'searchengines'
    searchengine = searchengines[Option.get 'defaultsearch']
    return searchengine.replace '{{keyword}}', url if searchengine
    googleSearch.replace '{{keyword}}', url

root = exports ? window
root.Option = Option
