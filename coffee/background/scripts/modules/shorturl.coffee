shortUrl = (msg) ->
  sendBackCurrentUrl = ->
    Post tab, {action: "Url.shortUrl", url: tab.url}

  [tab, auth] = [getTab(arguments), oauth.hasToken()]

  server_url = "https://www.googleapis.com/urlshortener/v1/url"

  headers = {"Content-type": "application/json"}
  headers["Authorization"] = oauth.getAuthorizationHeader(server_url, "POST") if auth

  params = {type: "POST", url: server_url, headers: headers, data: JSON.stringify(longUrl: encodeURI(tab.url))}
  $.ajax(params).fail(sendBackCurrentUrl).done(response) ->
    if response.error?.code is "401"
      oauth.clearTokens()
      sendBackCurrentUrl()
    else
      Post tab, {action: "Url.shortUrl", url: response.id}


root = exports ? window
root.shortUrl = shortUrl
