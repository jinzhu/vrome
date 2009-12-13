/**
 * Zoom
 */

var Zoom = new Object;

(function(){
  var levels = ['30%', '50%', '67%', '80%', '90%', '100%', '110%', '120%', '133%', '150%', '170%', '200%', '240%', '300%'];
  var default_index = levels.indexOf('100%');

  function currentLevel() {
    for(var i in levels){
      if(levels[i] == document.body.style.zoom){
        return Number(i);
      }
    }
    return default_index;
  }

  function setZoom(count) {
    var cur = count ? (currentLevel() + Number(count)) : default_index;
    // index should >= 0 && < levels.length
    cur = Math.min(levels.length - 1, Math.max(0,cur));

    // TODO
    localStorage.vimlike_zoom = cur - default_index;
    document.body.style.zoom  = levels[cur];
  }

  // Public API
  Zoom.In      = function() { setZoom( 1) };
  Zoom.Out     = function() { setZoom(-1) };
  Zoom.More    = function() { setZoom( 3) };
  Zoom.Reduce  = function() { setZoom(-3) };
  Zoom.Reset   = function() { setZoom(  ) };
  Zoom.Current = function() {
                   return (parseInt( levels[currentLevel()] ) / 100);
                 }
})()


//////////////////////////////////////////////////
// Zoom  FIXME
//////////////////////////////////////////////////
function zMode(){
  keyListener({add : zHandler,remove : initKeyBind});
}

function zHandler(e){
  addKeyBind( 'z', 'setZoom(  )', e );
  addKeyBind( 'i', 'setZoom( 1)', e );
  addKeyBind( 'o', 'setZoom(-1)', e );
  addKeyBind( 'm', 'setZoom( 3)', e );
  addKeyBind( 'r', 'setZoom(-3)', e );

  var pressedKey = get_key(e);
  if (/[ziomr]/.test(pressedKey) == false) {
    keyListener({add : initKeyBind,remove : zHandler});
  }
}
