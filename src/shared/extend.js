String.prototype.startWith = function(str) {
  return (this.match("^" + RegExp.escape(str))==str);
}

String.prototype.trimFirst = function(/* String || Array */ str) {
  if (typeof str == 'string') {
    return this.replace(new RegExp("^" + RegExp.escape(str)), "").trim();
  } else {
    var result = this;
    for(var i=0; i < str.length; i++) {
      result = result.replace(new RegExp("^" + RegExp.escape(str[i])), "").trim();
    }
    return result;
  }
}

RegExp.escape = function(text) {
  if (!arguments.callee.sRE) {
    var specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}
