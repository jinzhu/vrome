class AutoLink
  URL_REGEXP = /(((https?|ftp|file):\/\/)?([\w]{2,}\.)+[\w]{2,5}(\/[\S]+)*)/g

  textNodes = (elems)->
    elems.filter (e) ->
      e.data?.match(URL_REGEXP) and e.nodeType is 3 and e.nodeName not in ['INPUT', 'TEXTAREA']

  @makeLink: (elems=null) ->
    elems = textNodes(elems or $('*:visible').not('iframe').contents())
    for elem in elems
      $elem = $(elem)
      if $elem.parent().prop('tagName') isnt 'A'
        value = $elem.text().replace URL_REGEXP, ($0, $1) ->
          "<a href='#{if $1.isValidURL() then $1 else "http://#{$1}" }'>#{$1}</a>"
        $elem.after(value).remove()
    return
  desc @makeLink, 'Transforms URLs into clickable links'

root = exports ? window
root.AutoLink = AutoLink
