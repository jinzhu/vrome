class AutoLink

  url_regexp = /(((https?|ftp|file):\/\/)?([\w]{2,}\.)+[\w]{2,5}(\/[\S]+)*)/g
  textNodes = (elems)->
    e for e in elems when e.data?.match(url_regexp) and (e.nodeType == 3) and (e.nodeName not in ["INPUT", "TEXTAREA"])


  @makeLink: (elems=null) ->
    elems = textNodes(elems || jQuery("*:visible").not("iframe").contents())
    for elem in elems
      if jQuery(elem).parent().prop("tagName") != 'A'
        value = jQuery(elem).text().replace url_regexp, ($0, $1) ->
          "<a href='#{if /^(\w+\.)+\w+/.test($1) then "http://#{$1}" else $1}'>#{$1}</a>"
        jQuery(elem).after(value).remove()
    return
  desc @makeLink, "Transforms URLs into clickable links"


root = exports ? window
root.AutoLink = AutoLink
