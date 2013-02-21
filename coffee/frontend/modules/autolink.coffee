class AutoLink

  url_regexp = /(((https?|ftp|file):\/\/)?([\w]{2,}\.)+[\w]{2,5}(\/[\S]+)*)/g
  textNodes = (elems)->
    for e in elems when e.data?.match(url_regexp) and (e.nodeType == 3) and (e.nodeName not in ["INPUT", "TEXTAREA"])
      e


  @makeLink: (elems=null) ->
    elems = textNodes(elems || jQuery("*:visible").not("iframe").contents())
    for elem in elems
      if jQuery(elem).parent().prop("tagName") != 'A'
        value = jQuery(elem).text().replace url_regexp, ($0, $1) ->
          "<a href='#{if /^(\w+\.)+\w+/.test($1) then "http://#{$1}" else $1}'>#{$1}</a>"
        jQuery(elem).after(value).remove()


root = exports ? window
root.AutoLink = AutoLink
