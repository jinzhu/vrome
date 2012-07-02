// put your extension ID here
var myExtensionID = 'fecemdkpacpnmlbkjfadknbkfhadnnjm';
var latestVersion = -1;
var time = 500; // reload every X ms

function reload_ext()
{
  document.getElementById("toggle-" + myExtensionID).click();
}

function reloadExtension()
{
  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:20000';
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      if(latestVersion != xhr.responseText)
      {
        chrome.send('reload', [myExtensionID]);
        // recent versions of chrome
        var elem = document.getElementById(myExtensionID).getElementsByClassName('reload-link')[0]
        var oEvent = document.createEvent( "MouseEvents" );
        oEvent.initMouseEvent("click", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, elem);
        elem.dispatchEvent( oEvent );

        console.log("RELOADING at " + new Date());
        latestVersion = xhr.responseText;
      }
    }
  }

  xhr.setRequestHeader("Content-type", "text/plain");
  xhr.send(JSON.stringify({
    'method':'get_latest_version'
  }));
}

window.setInterval('reloadExtension()', time);
