function shortUrl(msg) {
  var tab = arguments[arguments.length-1],index;
  var port = chrome.tabs.connect(tab.id, {});

  function sendBackCurrentUrl() {
    port.postMessage({ action : "Url.shortUrl", url : tab.url });
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://is.gd/api.php?longurl=" + tab.url, false);
  xhr.onerror = sendBackCurrentUrl;
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        port.postMessage({ action : "Url.shortUrl", url : xhr.responseText });
      } else {
        sendBackCurrentUrl();
      }
    }
  }
  xhr.send();
}
