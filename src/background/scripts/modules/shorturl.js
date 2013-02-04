function shortUrl(msg) {
  var tab = arguments[arguments.length - 1];

  function sendBackCurrentUrl() {
    Post(tab, {
      action: "Url.shortUrl",
      url: tab.url
    });
  }

  var auth = oauth.hasToken();

  var xhr = new XMLHttpRequest();
  var server_url = "https://www.googleapis.com/urlshortener/v1/url";
  xhr.open("POST", server_url, false);

  if (auth) xhr.setRequestHeader('Authorization', oauth.getAuthorizationHeader(server_url, 'POST'));
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onerror = sendBackCurrentUrl;

  xhr.onreadystatechange = function() {
    var response = JSON.parse(xhr.responseText);
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        Post(tab, {
          action: "Url.shortUrl",
          url: response.id
        });
      } else {
        if (response.error.code == '401') {
          oauth.clearTokens();
        }
        sendBackCurrentUrl();
      }
    }
  };
  xhr.send(JSON.stringify({
    longUrl: encodeURI(tab.url)
  }));
}
