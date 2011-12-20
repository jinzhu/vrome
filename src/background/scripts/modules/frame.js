var Frame = (function() {
  var frames = [];

  function register(msg) {
    var tab = arguments[arguments.length-1];
    frames[tab.id] = frames[tab.id] || [];
    frames[tab.id].push(msg.frame);

    // loop and select biggest
    if(frames.length > 1) {
      var largestFrame = frames[0];
      var index = 0;
      for (index=0; index < frames.length; index++) {
        if (frames[index].area > largestFrame.area) {
          largestFrame = frames[index];
        }
      }

      Post(tab, { action: "Frame.select", frameId: largestFrame.id });
    }
  }

  function next(msg) {
    var tab = arguments[arguments.length-1];
    var current_frames = frames[tab.id];

    if(current_frames && current_frames.length > 0) {
      // find current frame
      var index;
      for (index=0; index < current_frames.length; index++) {
        if (current_frames[index].id == msg.frameId) { break; }
      }

      index += msg.count;

      if (index >= current_frames.length) { index = 0; }

      var nextFrameId = current_frames[index].id;
      Post(tab, { action: "Frame.select", frameId: nextFrameId });
    }
  }


  return {
    register : register,
    next : next
  };
})();
