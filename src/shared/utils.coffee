getLocalServerUrl = ->
  "http://127.0.0.1:" + Option.get("server_port")
checkServerStatus = ->
  $.ajax(getLocalServerUrl()).done(->
    $("#server_status").attr "src", "/images/server_online.png"
    $("#server_status").attr "alt", "Server Online"
  ).fail ->
    $("#server_status").attr "src", "/images/server_offline.png"
    $("#server_status").attr "alt", "Server Offline. Run ./vrome"


# returns hostname or "file" for file:// urls
getHostname = (href) ->
  res = window.location.host or "file"
  if href
    a = document.createElement("a")
    a.href = href
    res = a.host
  res
stringify = (obj) ->
  str = obj
  if _.isArray(obj)
    str = obj.join(", ")
  else str = JSON.stringify(obj)  if _.isObject(obj)
  str
object2table = (data) ->
  table = $("<table/>")
  if typeof data is "string"
    table.append $("<tr/>").append($("<td/>").text(data))
  else if data.type and data.type.match("^image/")
    img = document.createElement("img")
    img.onload = ->
      webkitURL.revokeOjbectURL @src

    img.src = webkitURL.createObjectURL(data)
    table.append $("<tr/>").append($("<td/>").append(img))
  else
    isEmpty = true
    for k of data
      v = data[k]
      th = $("<th/>").text(k)
      td = $("<td/>")
      unless typeof v is "object"
        td.text v
      else
        td.html object2table(v)
      table.append $("<tr/>").append(th, td)
      isEmpty = false
    table.append $("<tr><td>Empty.</td></tr>")  if isEmpty
  table

# TODO: add remote error logging
# Take into consideration uniqIds to identify possible attackers + IPs
logError = (err) ->
c = console
c.l = console.log
c.e = ->
  vv arguments_[0]  if typeof vv is "function"

# no stack property => Error Object from background page
# console.log(err, err.stack)

# no line number or file . it is from the frontend and good luck debugging that cluster fuck. consider adding  more try/catch and hope
