var Settings = (function() {
 var key = '__vrome_setting';

 function extend(to,from) {
   if (!to) { to = {}; }
   for(var p in from) { to[p] = from[p]; }
   return to;
 }

 function currentSetting(){
   try {
     return JSON.parse(localStorage[key] || "{}");
   } catch(e) {
     localStorage[key] = "{}"
     return {};
   }
 }

 function add(object) {
   if (object instanceof Object) {
     object            = extend( currentSetting(), object);
     localStorage[key] = JSON.stringify(object);
     return object;
   } else {
     var name  = arguments[0];
     var value = arguments[1];
     var old_object = object = currentSetting();
     var name = name.split('.');
     while (name.length > 1) { object = object[name.shift()]; }
     object[name.shift()] = value;
     localStorage[key] = JSON.stringify(old_object);
     return old_object;
   }
 }

 function get(names) {
   var object = currentSetting();
   if(!names) return object;

   var names = names.split('.');
   while (object && names[0]) { object = object[names.shift()]; }
   return (typeof object == 'undefined') ? '' : object;
 }

 return { add : add, get :get }
})();
