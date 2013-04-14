class Frame
  frameId = null

  @register: ->
    frameId = Math.floor(Math.random() * 999999999)
    area = innerWidth * innerHeight
    if not /doubleclick\.|qzone\.qq\.com|plusone\.google\.com/.test(window.location.href) and area > 100
      Post action: "Frame.register", frame: {id: frameId, area: innerWidth * innerHeight}

  @select: (msg) ->
    if frameId is msg.frameId
      window.focus()
      borderWas = document.body.style.border
      document.body.scrollIntoViewIfNeeded()
      document.body.style.border = "5px solid yellow"
      setTimeout (-> document.body.style.border = borderWas), 200
      code = "CmdBox.set({ title : 'Switched Frame To:#{document.location.href}',timeout : 4000});"
      Post action: "runScript", code: code

  @next: ->
    Post action: "Frame.next", frameId: frameId, count: times()
  desc @next, "Next {count} frame"

  @prev: -> Post action: "Frame.next", frameId: frameId, count: 0 - times()
  desc @prev, "Prev {count} frame"


root = exports ? window
root.Frame = Frame
