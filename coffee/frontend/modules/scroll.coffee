class Scroll
  vertical_moment = 15
  horizontal_moment = 15

  @top: -> scrollTo scrollX, 0
  desc @top, "Scroll to the top of the page"

  @bottom: -> scrollTo scrollX, document.body.scrollHeight
  desc @bottom, "Scroll to the bottom of the page"

  @first: -> scrollTo 0, scrollY if times(true, true) is 0
  desc @first, "Scroll to the left of the page"

  @last: -> scrollTo document.body.scrollWidth, scrollY
  desc @last, "Scroll to the right of the page"

  @up: -> scrollBy 0, times() * -vertical_moment
  desc @up, "Scroll up"

  @down: -> scrollBy 0, times() * vertical_moment
  desc @down, "Scroll down"

  @left: -> scrollBy times() * -horizontal_moment, 0
  desc @left, "Scroll left"

  @right: -> scrollBy times() * horizontal_moment, 0
  desc @right, "Scroll right"

  @nextPage: -> scrollBy 0, times() * $(window).height() * 0.95
  desc @nextPage, "Scroll down {count} full page"

  @prevPage: -> scrollBy 0, times() * -$(window).height() * 0.95
  desc @prevPage, "Scroll up {count} full page"

  @nextHalfPage: -> scrollBy 0, times() * $(window).height() / 2
  desc @nextHalfPage, "Scroll down {count} half page"

  @prevHalfPage: -> scrollBy 0, times() * -$(window).height() / 2
  desc @prevHalfPage, "Scroll up {count} half page"

  @toPercent: -> scrollTo scrollX, times(true) * $(document).height() / 100
  desc @toPercent, "Scroll to {count}% of the page"


root = exports ? window
root.Scroll = Scroll
