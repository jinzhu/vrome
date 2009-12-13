/**
 * Zoom
 */

var Scroll = (function(){
	var interval          = 20;
	var vertical_moment   = 250;
	var horizontal_moment = 100;
	var nextSmoothScroll;

	function smoothScroll(x,y){
		x = Number(x), y = Number(y);
		scrollBy(x,y);
		if (Math.max(Math.abs(x),Math.abs(y)) >= 1) {
			nextSmoothScroll = setTimeout(function(){ scrollBy(x,y); }, interval);
		}
	}

	function smoothScrollBy(x,y){
		clearTimeout(nextSmoothScroll);
		smoothScroll(x,y);
	}

	return {
	  top    : function(){ scrollTo(scrollX, 0);                 },
	  bottom : function(){ scrollTo(scrollX, document.height);   },
	  first  : function(){ scrollTo(0, scrollY);                 },
	  last   : function(){ scrollTo(document.width, scrollY);    },
	  up     : function(){ smoothScrollBy(0,vertical_moment);    },
	  down   : function(){ smoothScrollBy(0,-vertical_moment);   },
	  left   : function(){ smoothScrollBy(horizontal_moment,0);  },
	  right  : function(){ smoothScrollBy(-horizontal_moment,0); }
	}
})()
