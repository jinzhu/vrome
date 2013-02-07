Zoom = (->
  currentLevel = ->
    i = 0

    while i < levels.length
      return Number(i)  if levels[i] is (document.body.style.zoom or "100%")
      i++
  setZoom = (count, keepCurrentPage) -> #Number
#Boolean
    index = (if count then (currentLevel() + (times() * Number(count))) else default_index)
    
    # index should >= 0 && < levels.length
    index = Math.min(levels.length - 1, Math.max(0, index))
    level = index - default_index
    
    # 0 is default value. no need to set it for every site
    Settings.add "hosts.zoom_level", level
    topPercent = scrollY / document.height
    document.body.style.zoom = levels[index]
    scrollTo 0, topPercent * document.height  if keepCurrentPage
  levels = ["30%", "50%", "67%", "80%", "90%", "100%", "110%", "120%", "133%", "150%", "170%", "190%", "220%", "250%", "280%", "310%"]
  default_index = levels.indexOf("100%")
  setZoom: setZoom
  zoomIn: ->
    setZoom 1

  out: ->
    setZoom -1

  more: ->
    setZoom 3

  reduce: ->
    setZoom -3

  reset: ->
    setZoom()

  current_in: ->
    setZoom 1, true

  current_out: ->
    setZoom -1, true

  current_more: ->
    setZoom 3, true

  current_reduce: ->
    setZoom -3, true

  current_reset: ->
    setZoom 0, true

  current: ->
    parseInt(levels[currentLevel()]) / 100

  init: ->
    Zoom.setZoom Settings.get("hosts.zoom_level")
)()
