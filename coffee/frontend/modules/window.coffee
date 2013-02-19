class Window
  @create: () ->
    Post action: "Window.create"

  @close: () ->
    Post action: "Window.close"

  @close_all: () ->
    Post action: "Window.close_all"

  @only: () ->
    Tab.close type: "otherWindows"

  @capture: (msg) ->
    if msg?.url
      Clipboard.copy(msg.url)
      CmdBox.set title: "Captured current window,<a href='#{msg.url}' target='_blank'>Click to see the image</a>", timeout: 8000
    else
      CmdBox.remove()
      # Capture after remove the cmdbox
      setTimeout Post, 500, action: "Window.capture"


root = exports ? window
root.Window = Window
