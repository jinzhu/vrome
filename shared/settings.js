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

 function add(object) {
   object            = extend( currentSetting(), object);
   localStorage[key] = JSON.stringify(object);
   return object;
 }

 function get(names) {
   var name  = currentSetting();
   if(!names) return name;

   var names = names.split('.');

   while (name && names[0]) { name = name[names.shift()]; }
   return (typeof name == 'undefined') ? '' : name;
 }

 return { add : add, get :get }
})();
