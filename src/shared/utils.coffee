@getLocalServerUrl = -> "http://127.0.0.1:" + Option.get("server_port")
@checkServerStatus = ->
  $.ajax(@getLocalServerUrl()).done(->
    $("#server_status").attr "src", "/images/server_online.png"
    $("#server_status").attr "alt", "Server Online"
  ).fail ->
    $("#server_status").attr "src", "/images/server_offline.png"
    $("#server_status").attr "alt", "Server Offline. Run ./vrome"


# returns hostname or "file" for file:// urls
@getHostname = (href) ->
  return $("<a href='#{href}'>").get(0).host if href
  window.location.host or "file"


@stringify = (obj) ->
  return obj.join(", ") if $.isArray(obj)
  return JSON.stringify(obj) if obj instanceof Object
  obj

root = exports ? window
for m in ["getLocalServerUrl", "checkServerStatus", "getHostname", "stringify"]
  root[m] = self[m]
