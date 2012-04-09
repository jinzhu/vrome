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
