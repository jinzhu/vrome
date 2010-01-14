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
   var object = currentSetting();
   if(!names) return name;

   var names = names.split('.');
   while (object && names[0]) { object = object[names.shift()]; }
   return (typeof object == 'undefined') ? '' : object;
 }

 return { add : add, get :get }
})();
