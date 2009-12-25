var Settings = (function() {
 var key = '__vrome_setting';

 function extend(to,from) {
   if (!to) to = {};
   for(var p in from) to[p] = from[p];
   return to;
 }

 function set(object) {
   object = extend(JSON.parse(localStorage[key] || "{}"), object);

   localStorage[key] = JSON.stringify(object);
   return object;
 }

 function get(name) {
   var object = JSON.parse(localStorage[key]);
   return name ? (object[name] || '') : object;
 }

 return { set : set, get :get }
})();
