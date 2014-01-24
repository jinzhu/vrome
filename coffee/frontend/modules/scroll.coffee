class Scroll
  [VERTICAL_MOMENT, HORIZONTAL_MOMENT ] = [15, 15]

  @top: -> scrollTo window.scrollX, 0
  desc @top, 'Scroll to the top of the page'

  @bottom: -> scrollTo window.scrollX, document.body.scrollHeight
  desc @bottom, 'Scroll to the bottom of the page'

  @first: -> scrollTo 0, window.scrollY if times(true, true) is 0
  desc @first, 'Scroll to the leftmost of the page'

  @last: -> scrollTo document.body.scrollWidth, window.scrollY
  desc @last, 'Scroll to the rightmost of the page'

  @up: -> scrollBy 0, times() * -VERTICAL_MOMENT
  desc @up, 'Scroll up'

  @down: -> scrollBy 0, times() * VERTICAL_MOMENT
  desc @down, 'Scroll down'

  @left: -> scrollBy times() * -HORIZONTAL_MOMENT, 0
  desc @left, 'Scroll left'

  @right: -> scrollBy times() * HORIZONTAL_MOMENT, 0
  desc @right, 'Scroll right'

  @nextPage: -> scrollBy 0, times() * window.innerHeight * 0.95
  desc @nextPage, 'Scroll down {count} full page'

  @prevPage: -> scrollBy 0, times() * -window.innerHeight * 0.95
  desc @prevPage, 'Scroll up {count} full page'

  @nextHalfPage: -> scrollBy 0, times() * window.innerHeight / 2
  desc @nextHalfPage, 'Scroll down {count} half page'

  @prevHalfPage: -> scrollBy 0, times() * -window.innerHeight / 2
  desc @prevHalfPage, 'Scroll up {count} half page'

  @toPercent: -> scrollTo window.scrollX, times(true) * $(document).height() / 100
  desc @toPercent, 'Scroll to {count}% of the page'

root = exports ? window
root.Scroll = Scroll
