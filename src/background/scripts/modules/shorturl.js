function shortUrl(msg) {
  var tab = arguments[arguments.length-1],index;
  var port = chrome.tabs.connect(tab.id, {});

  function sendBackCurrentUrl() {
    port.postMessage({ action : "Url.shortUrl", url : tab.url });
  }

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://www.googleapis.com/urlshortener/v1/url", false);
  xhr.onerror = sendBackCurrentUrl;
  xhr.setRequestHeader("Content-type","application/json");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        port.postMessage({ action : "Url.shortUrl", url : JSON.parse(xhr.responseText).id });
      } else {
        sendBackCurrentUrl();
      }
    }
  };
  xhr.send(JSON.stringify({longUrl: encodeURI(tab.url)}));
}
