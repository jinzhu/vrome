/**
 * Zoom
 */

var Scroll = new Object();

(function(){

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

 Scroll.Down   = function(){ smoothScrollBy(0,vertical_moment);    } 
 Scroll.Up     = function(){ smoothScrollBy(0,-vertical_moment);   } 
 Scroll.Left   = function(){ smoothScrollBy(horizontal_moment,0);  } 
 Scroll.Right  = function(){ smoothScrollBy(-horizontal_moment,0); } 
 Scroll.Top    = function(){ scrollTo(scrollX, 0);                 } 
 Scroll.Bottom = function(){ scrollTo(scrollX, document.height);   } 
 Scroll.First  = function(){ scrollTo(0, scrollY);                 } 
 Scroll.Last   = function(){ scrollTo(document.width, scrollY);    } 

})()
