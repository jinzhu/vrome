class Window
  @create: () ->
    Post action: "Window.create"


root = exports ? window
root.Window = Window
