class Window
  @create: () ->
    Post action: "Window.create"

  @only: () ->
    Tab.close type: "otherWindows"


root = exports ? window
root.Window = Window
