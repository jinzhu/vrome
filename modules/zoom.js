/**
 * Zoom
 */

var Zoom = (function(){
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
    localStorage.vimlike_zoom = cur - default_index;
    document.body.style.zoom  = levels[cur];
  }

  // Public API
	return {
		'in'    : function() { setZoom( 1) },
		out     : function() { setZoom(-1) },
		more    : function() { setZoom( 3) },
		reduce  : function() { setZoom(-3) },
		reset   : function() { setZoom(  ) },
		current : function() { return (parseInt( levels[currentLevel()]) / 100); },
		init    : function() { setZoom(localStorage.vimlike_zoom); }
	}
})()
