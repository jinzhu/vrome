var Scroll = (function(){
	var vertical_moment   = 15;
	var horizontal_moment = 15;

  // API
	return {
	  top      : function () { scrollTo(scrollX, 0);                 },
	  bottom   : function () { scrollTo(scrollX, document.body.scrollHeight);   },
    first    : function () {
                 if (times(/*read*/true,/*keep*/true) === 0) { scrollTo(0, scrollY); }
               },
	  last     : function () { scrollTo(document.body.scrollWidth, scrollY);    },

	  up       : function () { scrollBy(0,times() * -vertical_moment);   },
	  down     : function () { scrollBy(0,times() * vertical_moment);   },
	  left     : function () { scrollBy(times() * -horizontal_moment,0); },
	  right    : function () { scrollBy(times() * horizontal_moment,0); },

		nextPage : function () { scrollBy(0,times() * window.innerHeight*0.95);  },
		prevPage : function () { scrollBy(0,times() * -window.innerHeight*0.95); },
    nextHalfPage : function () { scrollBy(0,times() * window.innerHeight/2); },
    prevHalfPage : function () { scrollBy(0,times() * -window.innerHeight/2);},

    toPercent : function () { scrollTo(scrollX,times(true) * document.height / 100); }
	};
})();
