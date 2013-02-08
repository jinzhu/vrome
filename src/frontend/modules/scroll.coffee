class Scroll
  vertical_moment = 15
  horizontal_moment = 15
  

  @top: -> scrollTo scrollX, 0

  @bottom: -> scrollTo scrollX, document.body.scrollHeight

  @first: -> scrollTo 0, scrollY if times(true, true) is 0

  @last: -> scrollTo document.body.scrollWidth, scrollY

  @up: -> scrollBy 0, times() * -vertical_moment

  @down: -> scrollBy 0, times() * vertical_moment

  @left: -> scrollBy times() * -horizontal_moment, 0

  @right: -> scrollBy times() * horizontal_moment, 0

  @nextPage: -> scrollBy 0, times() * $(window).height() * 0.95

  @prevPage: -> scrollBy 0, times() * -$(window).height() * 0.95

  @nextHalfPage: -> scrollBy 0, times() * $(window).height() / 2

  @prevHalfPage: -> scrollBy 0, times() * -$(window).height() / 2

  @toPercent: -> scrollTo scrollX, times(true) * $(document).height() / 100


root = exports ? window
root.Scroll = Scroll
