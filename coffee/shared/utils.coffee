root = exports ? window

root.getLocalServerUrl = -> "http://127.0.0.1:#{Option.get('server_port')}"
root.checkServerStatus = ->
  request = $.ajax getLocalServerUrl()
  request.done ->
    $('#server_status').attr 'src', '/images/server_online.png'
    $('#server_status').attr 'alt', 'Server Online'
  request.fail ->
    $('#server_status').attr 'src', '/images/server_offline.png'
    $('#server_status').attr 'alt', 'Server Offline. Run ./vrome'

root.rabs = (num, total) ->
  # if num is -11 and total is 10:
  # ((-11 % 10) + 10) % 10
  # (-1 + 10) % 10
  # 9
  ((num % total) + total) % total

root.desc = (func, description) ->
  func.description = description

root.fixRelativePath = (url) ->
  # http://google.com
  return url if /:\/\//.test(url)

  # /admin
  return document.location.origin + url if (/^\//.test(url))

  # ../users || ./products || ../users
  url += '/' if url.match(/\/?\.\.$/) # .. -> ../

  pathname = document.location.origin + document.location.pathname.replace(/\/+/g, '/')
  for path in url.split('..')
    if path.match(/^\//)
      pathname = pathname.replace(/\/[^\/]*\/?$/, '') + path
    else if path.match(/^.\//)
      pathname = pathname.replace(/\/$/, '') + path.replace(/^.\//, '/')
  pathname
