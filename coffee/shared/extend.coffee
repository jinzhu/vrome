$.fn.reverse = [].reverse

String::startsWith = (str) ->
  return true if str is undefined
  @substring(0, str.length) is str

String::endsWith = (str) ->
  return true if str is undefined
  @substring(@length - str.length, @length) is str

String::trim = ->
  @replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '')

String::isValidURL = ->
  /(?:https?|ftp|file|chrome-extension):\/\//.test this

String::trimFirst = (str) ->
  @trimFirstStr(str).trim()

String::trimFirstStr = (str) -> # don't trim space
  return @substring str.length if typeof str is 'string' and @startsWith str
  this

String::escape = ->
  $('<div>').text(this).html()
