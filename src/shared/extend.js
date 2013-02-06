String.prototype.startWith = function(str) {
  return (this.match("^" + RegExp.escape(str)) == str);
}

String.prototype.trim = function() {
  return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""))
}

String.prototype.startsWith = function(str) {
  return this.startWith(str);
}

String.prototype.endsWith = function(str) {
  return (this.match(str + "$") == str)
}

String.prototype.escapeRegExp = function() {
  // From MooTools core 1.2.4
  return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
}

String.prototype.trimFirst = function( /* String || Array */ str) {
  if (typeof str == 'string') {
    return this.replace(new RegExp("^" + RegExp.escape(str)), "").trim();
  } else {
    var result = this;
    for (var i = 0; i < str.length; i++) {
      result = result.replace(new RegExp("^" + RegExp.escape(str[i])), "").trim();
    }
    return result;
  }
}

String.prototype.reverse = function() {
  return this.split('').reverse().join('')
}

String.prototype.isUpperCase = function() {
  return (this == this.toUpperCase());
}

String.prototype.isLowerCase = function() {
  return (this == this.toLowerCase());
}

String.prototype.firstLetterUpper = function() {
  var ret = this.replace('', '')
  ret = ret.charAt(0).toUpperCase() + ret.substring(1)
  return ret
}


String.prototype.escape = function() {
  return _.escape(this);
}

String.prototype.formatLong = function(max, className) {
  var ori = this
  var ret = ori.substring(0, max)

  ret = _.escape(ret)

  // create link
  if (ori.length > max) {
    var chunk = ori.substring(max)
    var a = document.createElement('a')
    a.href = "javascript:void(0);"
    a.setAttribute('class', className)
    a.setAttribute('onclick', "var tmp = this.title;this.title = this.innerHTML;this.innerHTML = tmp;")
    a.innerHTML = '&nbsp;...[more]'
    a.title = chunk

    ret += a.outerHTML
  }

  return ret
}

String.prototype.formatLineBreaks = function() {
  return this.replace(/\n/g, '<br/>')
}

String.prototype.isValidURL = function() {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return this.match(exp) !== null
}

String.prototype.transformURL = function() {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return this.replace(exp, "<a href='$1'>$1</a>");
}

RegExp.escape = function(text) {
  if (!arguments.callee.sRE) {
    var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
    arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}
