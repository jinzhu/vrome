class Zoom
  levels = ["30%", "50%", "67%", "80%", "90%", "100%", "110%", "120%", "133%", "150%", "170%", "190%", "220%", "250%", "280%", "310%"]
  default_index = levels.indexOf "100%"

  currentLevel = ->
    index = levels.indexOf(document?.body?.style?.zoom)
    if index == -1 then default_index else index

  setZoom = (count, keepCurrentPage) ->
    index = (if count then (currentLevel() + times() * count) else default_index)
    
    # index should >= 0 && < levels.length
    index = Math.min(levels.length - 1, Math.max(0, index))
    level = index - default_index
    
    # 0 is default value. no need to set it for every site
    Settings.add zoom_level: (index - default_index), scope_key: "host"
    topPercent = scrollY / document.height
    document.body.style.zoom = levels[index]
    scrollTo 0, topPercent * document.height if keepCurrentPage


  @zoomIn: -> setZoom 1

  @out: -> setZoom -1

  @more: -> setZoom 3

  @reduce: -> setZoom -3

  @reset: -> setZoom()

  @current_in: -> setZoom 1, true

  @current_out: -> setZoom -1, true

  @current_more: -> setZoom 3, true

  @current_reduce: -> setZoom -3, true

  @current_reset: -> setZoom 0, true

  @current: -> parseInt(levels[currentLevel()]) / 100

  @init: -> setZoom Settings.get("zoom_level")


root = exports ? window
root.Zoom = Zoom
