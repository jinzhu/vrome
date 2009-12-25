var Settings = (function() {
 var key = '__vrome_setting';

 function extend(to,from) {
   if (!to) to = {};
   for(var p in from) to[p] = from[p];
   return to;
 }

 function currentSetting(){
   return JSON.parse(localStorage[key] || "{}");
 }

 function set(object) {
   object            = extend( currentSetting(), object);
   localStorage[key] = JSON.stringify(object);
   return object;
 }

 function get(name) {
   var object = currentSetting();
   return name ? (object[name] || '') : object;
 }

 return { set : set, get :get }
})();
