SERVER_URL = 'https://www.googleapis.com/urlshortener/v1/url'

window.shortUrl = (msg) ->
  sendBackCurrentUrl = ->
    Post msg.tab, action: 'Url.shortUrl', url: msg.tab.url

  auth = oauth.hasToken()

  headers = 'Content-type': 'application/json'
  headers['Authorization'] = oauth.getAuthorizationHeader SERVER_URL, 'POST' if auth

  params =
    type:    'POST'
    url:     SERVER_URL
    headers: headers
    data:    JSON.stringify(longUrl: encodeURI msg.tab.url)
  $.ajax(params).fail(sendBackCurrentUrl).done (response) ->
    if response.error?.code is '401'
      oauth.clearTokens()
      sendBackCurrentUrl()
    else
      Post msg.tab, action: 'Url.shortUrl', url: response.id
