shortUrl = (msg) ->
  sendBackCurrentUrl = ->
    Post tab,
      action: "Url.shortUrl"
      url: tab.url

  tab = arguments_[arguments_.length - 1]
  auth = oauth.hasToken()
  xhr = new XMLHttpRequest()
  server_url = "https://www.googleapis.com/urlshortener/v1/url"
  xhr.open "POST", server_url, false
  xhr.setRequestHeader "Authorization", oauth.getAuthorizationHeader(server_url, "POST")  if auth
  xhr.setRequestHeader "Content-type", "application/json"
  xhr.onerror = sendBackCurrentUrl
  xhr.onreadystatechange = ->
    response = JSON.parse(xhr.responseText)
    if xhr.readyState is 4
      if xhr.status is 200
        Post tab,
          action: "Url.shortUrl"
          url: response.id

      else
        oauth.clearTokens()  if response.error.code is "401"
        sendBackCurrentUrl()

  xhr.send JSON.stringify(longUrl: encodeURI(tab.url))
