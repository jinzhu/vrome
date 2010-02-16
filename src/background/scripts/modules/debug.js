function Debug(str) {
  console.log(str);
}

function debug(msg) {
  var tab = arguments[arguments.length-1];
  Debug(tab.url + " : \n" + msg.message);
}
