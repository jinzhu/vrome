var Clipboard = (function() {
  function createTextArea( /*String*/ data) {
    var textNode = document.createElement('textarea');
    textNode.style.position = "fixed";
    textNode.style.left = "-1000%";
    textNode.value = data;
    document.body.appendChild(textNode);
    return textNode;
  }

  function copy(msg) {
    var textNode = createTextArea(msg.value);
    textNode.select();
    document.execCommand('Copy');
    document.body.removeChild(textNode);
  }

  function read() {
    var textNode = createTextArea("");
    textNode.select();
    document.execCommand('paste');
    var result = textNode.value;
    document.body.removeChild(textNode);
    return result;
  }

  function getContent(msg) {
    var tab = arguments[arguments.length - 1];
    Post(tab, {
      action: msg.redirect,
      data: Clipboard.read()
    });

  }

  return {
    copy: copy,
    read: read,
    getContent: getContent
  };
})();
