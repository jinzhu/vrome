String.prototype.startWith = function(str) {
  return (this.match("^"+str)==str)
}

String.prototype.trimFirst = function(str) {
  return this.replace(new RegExp("^"+str), "").trim()
}
