$.fn.reverse = [].reverse

String::startsWith = (str) ->
  return true if str is undefined
  this.substring(0, str.length) is str

String::endsWith = (str) ->
  return true if str is undefined
  this.substring(this.length - str.length, this.length) is str

String::reverse = ->
  @split('').reverse().join('')

String::trim = ->
  @replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '')

String::isValidURL = ->
  /https?|ftp|file:\/\//.test this

String::trimFirst = (str) -> # String || Array
  if typeof str is 'string'
    @trimFirstStr(str).trim()
  else
    result = this
    result = result.trimFirstStr(s).trim() for s in str
    result

String::trimFirstStr = (str) -> # don't trim space
  return @substring str.length if typeof str is 'string' and @startsWith str
  this

String::escape = ->
  $('<div>').text(this).html()
