function getLocalServerUrl() {
  return 'http://127.0.0.1:' + Option.get('server_port');
}

function checkServerStatus() {
  $.ajax(getLocalServerUrl()).done(function() {
    $('#server_status').attr('src', '/images/server_online.png');
    $('#server_status').attr('alt', 'Server Online');
  }).fail(function() {
    $('#server_status').attr('src', '/images/server_offline.png');
    $('#server_status').attr('alt', 'Server Offline. Run ./vrome');
  })
}

// returns hostname or "file" for file:// urls

function getHostname() {
  return window.location.host || "file"
}

var c = console;
c.l = console.log;


function object2table(data) {
  var table = $("<table/>");
  if (typeof data === "string") {
    table.append($("<tr/>").append($("<td/>").text(data)));
  } else if (data.type && data.type.match("^image/")) {
    var img = document.createElement("img");
    img.onload = function() {
      webkitURL.revokeOjbectURL(this.src);
    };
    img.src = webkitURL.createObjectURL(data);
    table.append($("<tr/>").append($("<td/>").append(img)));
  } else {
    var isEmpty = true;
    for (var k in data) {
      var v = data[k];
      var th = $("<th/>").text(k);
      var td = $("<td/>");
      if (typeof v != "object") {
        td.text(v);
      } else {
        td.html(object2table(v));
      }
      table.append($("<tr/>").append(th, td));
      isEmpty = false;
    }
    if (isEmpty) table.append($("<tr><td>Empty.</td></tr>"));
  }
  return table;
}
