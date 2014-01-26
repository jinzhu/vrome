class window.Frame
  @select: (msg) ->
    if location.href is msg.href
      area = innerWidth * innerHeight
      return Post action: 'Frame.next', count: 1 if area <= 100
      window.focus()
      originalBorder = document.body.style.border
      document.body.scrollIntoViewIfNeeded()
      document.body.style.border = '5px solid yellow'
      setTimeout (-> document.body.style.border = originalBorder), 200
      code = "CmdBox.set({ title: 'Switched Frame To:#{document.location.href}', timeout: 2000 });"
      Post { action: 'runScript', code }

  @next: -> Post action: 'Frame.next', count: times()
  desc @next, 'Next {count} frame'

  @prev: -> Post action: 'Frame.next', count: -times()
  desc @prev, 'Previous {count} frame'
