$.fn.reverse = [].reverse

String::startsWith = (str) ->
  return true if str is undefined
  @substring(0, str.length) is str

String::endsWith = (str) ->
  return true if str is undefined
  @substring(@length - str.length, @length) is str

String::isValidURL = ->
  /(?:https?|ftp|file|chrome-extension):\/\//.test this

String::getValidURL = ->
  if @isValidURL() then this else "http://#{this}"

String::trimFirst = (str) ->
  @trimFirstStr(str).trim()

String::trimFirstStr = (str) -> # don't trim space
  return @substring str.length if typeof str is 'string' and @startsWith str
  this

String::escape = ->
  $('<div>').text(this).html()

String::isUpperCaseLetter = ->
  this.length is 1 and this >= 'A' and this <= 'Z'

Math.sign = (number) ->
  if number < 0 then -1 else if number > 0 then 1 else 0
