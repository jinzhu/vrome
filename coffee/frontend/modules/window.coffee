class Window
  @create: () ->
    Post action: "Window.create"

  @close: () ->
    Post action: "Window.close"

  @close_all: () ->
    Post action: "Window.close_all"

  @only: () ->
    Tab.close type: "otherWindows"


root = exports ? window
root.Window = Window
