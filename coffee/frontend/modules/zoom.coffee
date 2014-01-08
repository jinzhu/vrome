class Zoom
  LEVELS = ['30%', '50%', '67%', '80%', '90%', '100%', '110%', '120%', '133%', '150%', '170%', '190%', '220%', '250%', '280%', '310%']
  DEFAULT_INDEX = LEVELS.indexOf '100%'

  currentLevel = ->
    index = LEVELS.indexOf(document?.body?.style?.zoom)
    if index is -1 then DEFAULT_INDEX else index

  setZoom = (count, keepCurrentPage) ->
    index = if count then (currentLevel() + times() * count) else DEFAULT_INDEX

    # index should >= 0 && < LEVELS.length
    index = Math.min(LEVELS.length - 1, Math.max(0, index))
    level = index - DEFAULT_INDEX

    # 0 is default value, no need to set it for every site
    Settings.add zoom_level: (index - DEFAULT_INDEX), scope_key: 'host'
    topPercent = scrollY / document.height
    document.body.style.zoom = LEVELS[index]
    scrollTo 0, topPercent * document.height if keepCurrentPage

  @zoomIn: -> setZoom 1
  desc @zoomIn, 'Zoom in, based on the center of the screen'

  @out: -> setZoom -1
  desc @out, 'Zoom out, based on the center of the screen'

  @more: -> setZoom 3
  desc @more, '3x Zoom in, based on the center of the screen'

  @reduce: -> setZoom -3
  desc @reduce, '3x Zoom out, based on the center of the screen'

  @reset: -> setZoom()
  desc @reset, 'Zoom reset, based on the center of the screen'

  @current_in: -> setZoom 1, true
  desc @current_in, 'Zoom in, based on the beginning of the screen'

  @current_out: -> setZoom -1, true
  desc @current_out, 'Zoom out, based on the beginning of the screen'

  @current_more: -> setZoom 3, true
  desc @current_more, 'x3 Zoom in, based on the beginning of the screen'

  @current_reduce: -> setZoom -3, true
  desc @current_reduce, 'x3 Zoom out, based on the beginning of the screen'

  @current_reset: -> setZoom 0, true
  desc @current_reset, 'Zoom reset, based on the beginning of the screen'

  @current: -> parseInt(LEVELS[currentLevel()], 10) / 100

  @init: -> setZoom Settings.get('zoom_level')

root = exports ? window
root.Zoom = Zoom
