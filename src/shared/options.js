var Option = (function() {
  var options = {
    nextpattern : ['(下|后)一页','下一頁','^\\s*Next\\s*$','^>$','^More$','(^(>>|››|»))|((»|››|>>)$)'],
    previouspattern : ['(上|前)一页','上一頁','^\\s*Prev(ious)?\\s*$','^<$','(^(<<|‹‹|«))|((<<|‹‹|«)$)'],
    disablesites : "",
    editor : "gvim -f"
  }

  function get(key) {
    var value  = (Settings.get('background.configure.set') || Settings.get('configure.set'))[key];
    var option = options[key];

    if (value instanceof Array) {
      if (value[1]) {
        option = (option instanceof Array) ? option.concat(value[0]) : (options + value[0]);
      } else {
        option = value[0];
      }
    }
    return option;
  }

  return { get : get }
})()
