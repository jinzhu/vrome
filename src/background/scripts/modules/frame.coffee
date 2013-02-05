Frame = (->
  register = (msg) ->
    tab = arguments_[arguments_.length - 1]
    frames[tab.id] = frames[tab.id] or []
    frames[tab.id].push msg.frame
  next = (msg) ->
    tab = arguments_[arguments_.length - 1]
    current_frames = frames[tab.id]
    if current_frames and current_frames.length > 0
      
      # find current frame
      index = undefined
      index = 0
      while index < current_frames.length
        break  if current_frames[index].id is msg.frameId
        index++
      index += msg.count
      index = 0  if index < 0
      index = 0  if index >= current_frames.length
      nextFrameId = current_frames[index].id
      Post tab,
        action: "Frame.select"
        frameId: nextFrameId

  frames = {}
  register: register
  next: next
)()
