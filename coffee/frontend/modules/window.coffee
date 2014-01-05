class Window
  @create: -> Post action: 'Window.create'
  desc @create, 'Open a new window'

  @close: -> Post action: 'Window.close'
  desc @close, 'Close current window'

  @closeAll: -> Post action: 'Window.closeAll'
  desc @closeAll, 'Close all windows (quitall)'

  @only: -> Tab.close type: 'otherWindows'
  desc @only, 'Close other windows'

  @saveas: (msg) ->
    if msg?.filename
      CmdBox.set title: "Downloaded as '#{msg.filename}'", timeout: 4000
    else
      filename = CmdBox.get().argument
      CmdBox.remove()
      setTimeout Post, 500, action: 'Window.save_page', filename: filename
  desc @saveas, 'Save page as'

  @capture: (msg) ->
    if msg?.url
      Clipboard.copy msg.url
      CmdBox.set
        title:   "Captured current window,<a href='#{msg.url}' target='_blank'>Click to see the image</a>"
        timeout: 8000
    else
      CmdBox.remove()
      # Capture after remove the cmdbox
      setTimeout Post, 500, action: 'Window.capture'
  desc @capture, 'Capture visible tab'

root = exports ? window
root.Window = Window
