/**
 * Zoom
 */
var Scroll = (function(){
	var vertical_moment   = 30;
	var horizontal_moment = 30;

	return {
	  top      : function(){ scrollTo(scrollX, 0);                 },
	  bottom   : function(){ scrollTo(scrollX, document.height);   },
	  first    : function(){ scrollTo(0, scrollY);                 },
	  last     : function(){ scrollTo(document.width, scrollY);    },

	  up       : function(){ scrollBy(0,-vertical_moment);   },
	  down     : function(){ scrollBy(0, vertical_moment);   },
	  left     : function(){ scrollBy(-horizontal_moment,0); },
	  right    : function(){ scrollBy( horizontal_moment,0); },

		nextPage : function(){ scrollBy(0, window.innerHeight*0.95); },
		prevPage : function(){ scrollBy(0,-window.innerHeight*0.95); },
    nextHalfPage : function(){ scrollBy(0, window.innerHeight/2);},
    prevHalfPage : function(){ scrollBy(0,-window.innerHeight/2);},

    toPercent : function(){
      scrollTo(0, KeyEvent.times() * document.height / 100);
    },
	}
})()
