shortUrl = (msg) ->
  sendBackCurrentUrl = ->
    Post msg.tab, {action: "Url.shortUrl", url: msg.tab.url}

  auth = oauth.hasToken()

  server_url = "https://www.googleapis.com/urlshortener/v1/url"

  headers = {"Content-type": "application/json"}
  headers["Authorization"] = oauth.getAuthorizationHeader(server_url, "POST") if auth

  params = {type: "POST", url: server_url, headers: headers, data: JSON.stringify(longUrl: encodeURI(msg.tab.url))}
  $.ajax(params).fail(sendBackCurrentUrl).done (response) ->
    if response.error?.code is "401"
      oauth.clearTokens()
      sendBackCurrentUrl()
    else
      Post msg.tab, {action: "Url.shortUrl", url: response.id}


root = exports ? window
root.shortUrl = shortUrl
