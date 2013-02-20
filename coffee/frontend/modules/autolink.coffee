class AutoLink

  url_regexp = /(((https?|ftp|file):\/\/)?([\w]+\.)+[\w]+(\/[\S]+)*)/g
  textNodes = (root)->
    root.contents().filter -> @nodeType == 3

  @makeLink: (elems=null) ->
    textNodes(elems || $("*")).each ->
      try
        if $(this).parent().prop("tagName") != 'A'
          value = @data.replace url_regexp, ($0, $1) -> "<a href='#{$1}'>#{$1}</a>"
          $(this).after($(value)).remove()


root = exports ? window
root.AutoLink = AutoLink
