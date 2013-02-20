class AutoLink

  url_regexp = /(((https?|ftp|file):\/\/)?([\w]{2,}\.)+[\w]{2,5}(\/[\S]+)*)/g
  textNodes = ()->
    $("*:visible").contents().filter ->
      try
        @data?.match(url_regexp) and (@nodeType == 3) and ($(this).prop("nodeName") not in ["INPUT", "TEXTAREA"])


  @makeLink: (elems=null) ->
    textNodes().each ->
      if $(this).parent().prop("tagName") != 'A'
        value = $(this).text().replace url_regexp, ($0, $1) ->
          "<a href='#{if /^(\w+\.)+\w+/.test($1) then "http://#{$1}" else $1}'>#{$1}</a>"
        $(this).after(value).remove()


root = exports ? window
root.AutoLink = AutoLink
