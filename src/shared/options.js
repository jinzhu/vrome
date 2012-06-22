var Option = (function() {
  var options = {
    // == search
    nextpattern: ['(下|后)一页', '下一頁', '^\\s*Next\\s*$', '^>$', '^More$', '(^(>>|››|»))|((»|››|>>)$)'],
    previouspattern: ['(上|前)一页', '上一頁', '^\\s*Prev(ious)?\\s*$', '^<$', '(^(<<|‹‹|«))|((<<|‹‹|«)$)'],

    // == global
    open_tab_on_the_right: false,
    disablesites: "",
    editor: "gvim -f",
    server_port: 20000,
    searchengines: {
      "google": "http://www.google.com/search?q={{keyword}}",
      "yahoo": "http://search.yahoo.com/search?p={{keyword}}",
      "bing": "http://www.bing.com/search?q={{keyword}}",
      "wikipedia": "http://en.wikipedia.org/wiki/{{keyword}}",
      "answers": "http://www.answers.com/main/ntquery?s={{keyword}}",
      "twitter": "https://twitter.com/search/{{keyword}}"
    },
    defaultsearch: 'google',
    // used by automated tests
    test_mode: 0,

    // == autocomplete boxes
    enable_vrome_key: '<C-Esc>',
    autocomplete_next: "<Down>",
    autocomplete_prev: "<Up>",
    autocomplete_next_10: "<Tab>",
    autocomplete_prev_10: "<S-Tab>",

    // == hint mode
    hintkeys: 'jlkhfsdagwerui',
    hints_highlight: 1,
    // used to overwrite numbers and use hint string instead
    useletters: 0,
    // allows numeric keys to propagate
    allow_numeric: 0,

    // == command line
    // shows keys + matches them to commands as you type
    showstatus: 1
  };

  function get(key) {
    var value = (Settings.get('background.configure.set') || Settings.get('configure.set'))[key];

    // use default options when testing. Otherwise, the custom config might break the tests
    if (options['test_mode']) value = options[key]

    var option = options[key];

    if (value instanceof Array) {
      var new_value = value[0];
      var plus_it = value[1];

      if (option instanceof Array) {
        if (new_value.startWith('[')) {
          try {
            new_value = eval(new_value);
          } catch (e) {
            new_value = [];
          }
        } else {
          new_value = [new_value];
        }
        // += or =
        option = plus_it ? option.concat(new_value) : new_value;
      } else if (option instanceof Object) {
        try {
          new_value = JSON.parse(new_value);
        } catch (e) {
          new_value = {};
        }

        if (plus_it) {
          for (var i in new_value) {
            option[i] = new_value[i];
          }
        } else {
          option = new_value;
        }
      } else {
        option = plus_it ? (option + new_value) : new_value;
      }
    }
    return option;
  }

  function default_search_url(url) {
    var searchengines = Option.get('searchengines');
    var searchengine = searchengines[Option.get('defaultsearch')];

    if (searchengine) {
      url = searchengine.replace("{{keyword}}", url);
    } else {
      for (var j in searchengines) {
        url = searchengines[j].replace("{{keyword}}", url);
        break;
      }
    }

    return url
  }

  return {
    get: get,
    default_search_url: default_search_url,
    defaultOptions: options
  };
})();
