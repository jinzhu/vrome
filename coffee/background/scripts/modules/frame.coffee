class Frame
  frames = {}

  @register: (msg) ->
    tab = getTab(arguments)
    frames[tab.id] ||= []
    frames[tab.id].push msg.frame

  @next: (msg) ->
    tab = getTab(arguments)
    current_frames = frames[tab.id] || []
    return unless current_frames.length > 0

    (current_frame = frame) for frame in current_frames when frame.id is msg.frameId

    index = current_frames.indexOf(current_frame) + 1
    index = 0 if index > (current_frames.length - 1)

    Post tab, {action: "Frame.select", frameId: current_frames[index].id}


root = exports ? window
root.Frame = Frame
