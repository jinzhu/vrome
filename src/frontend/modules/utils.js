var Platform = {
  linux : navigator.userAgent.indexOf("Linux") != -1,
  mac   : navigator.userAgent.indexOf("Mac") != -1,
  win   : navigator.userAgent.indexOf("Windows") != -1
}

var times = function(/*Boolean*/ raw,/*Boolean*/ read) {
  var count = raw ? KeyEvent.times(read) : (KeyEvent.times(read) || 1);
  Debug('KeyEvent.times:' + count);
  return count;
};

var Post = function(msg) {
  var port = chrome.extension.connect();
  port.postMessage(msg);
}

function isElementVisible(elem) {
  var win_top     = window.scrollY / Zoom.current();
  var win_bottom  = win_top + window.innerHeight;
  var win_left    = window.scrollX / Zoom.current();
  var win_right   = win_left + window.innerWidth;

  var pos         = elem.getBoundingClientRect();
  var elem_top    = win_top  + pos.top;
  var elem_bottom = win_top  + pos.bottom;
  var elem_left   = win_left + pos.left;
  var elem_right  = win_left + pos.left;

  return pos.height != 0 && pos.width != 0 && elem_bottom >= win_top && elem_top <= win_bottom && elem_left <= win_right && elem_right >= win_left;
}

function clickElement(element,opt) {
  //event.initMouseEvent(type, canBubble, cancelable, view,
  //                     detail, screenX, screenY, clientX, clientY,
  //                     ctrlKey, altKey, shiftKey, metaKey,
  //                     button, relatedTarget);
  // https://developer.mozilla.org/en/DOM/event.initMouseEvent
  opt = opt || {};

  var event = document.createEvent("MouseEvents");
  event.initMouseEvent("click", true, true, window,
      0, 0, 0, 0, 0,
      !!opt.ctrl, !!opt.alt, !!opt.shift, !!opt.meta,
      0, null);
  element.dispatchEvent(event);
}

function runIt(func,args) {
  if(func) initFunction.push([func,args]);

  if(document.body){
    for(var i = 0;i < initFunction.length; i++){
      func = initFunction[i];
      if(func instanceof Function){
				Debug("RunIt:" + func);
        func.call();
      }else{
				if(func[0] instanceof Function){
					Debug("RunIt: function" + func[0] + " arguments:" + func[1]);
					func[0].apply('',func[1]);
				}
      }
    }
    initFunction = [];
  }else{
    setTimeout(runIt,50);
  }
}

function getSelected() {
  return window.getSelection().toString();
}

function showHelp() {
  console.log(chrome.extension.getURL("README.html"));
  Post({action: "Tab.openUrl", url: chrome.extension.getURL("README.html"),newtab : true});
}
