class window.Scroll
  [currentlySelectedElement, biggestVerticallyScrollable, biggestHorizontallyScrollable] = []

  [VERTICAL_MOMENT, HORIZONTAL_MOMENT] = [15, 15]

  getBiggestScrollable = (direction) ->
    biggestScrollable = null
    $body.find(direction).each (_, element) ->
      $element = $(element)

      area = $element.width() * $element.height()
      if biggestScrollable
        $biggestScrollable = $(biggestScrollable)
        biggestArea = $biggestScrollable.width() * $biggestScrollable.height()
      else
        biggestArea = -1

      biggestScrollable = element if area > biggestArea
    biggestScrollable

  getClosestScrollable = (element, direction) ->
    $(element).closest(direction).get(0)

  $(document.documentElement).click (e) ->
    clickedElement = document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset)
    currentlySelectedElement = getClosestScrollable clickedElement, ':scrollable'

  generateWheelEvent = (element, offsetX, offsetY) ->
    evt = document.createEvent 'WheelEvent'
    evt.initWebKitWheelEvent -offsetX, -offsetY
    element.dispatchEvent evt

  pageHasVerticalScroll = ->
    return yes unless document.body

    if window.innerHeight
      document.body.offsetHeight > window.innerHeight
    else
      document.documentElement.scrollHeight > document.documentElement.offsetHeight or
        document.body.scrollHeight > document.body.offsetHeight

  isScrollableElement = (element) ->
    element and element isnt document.body

  isElementScrolledToEnd = (offsetX, offsetY, element) ->
    return no unless element

    (offsetY > 0 and element.scrollHeight - element.scrollTop is element.clientHeight) or
      (offsetY < 0 and element.scrollTop is 0) or
      (offsetX > 0 and element.scrollWidth - element.scrollLeft is element.clientWidth) or
      (offsetX < 0 and element.scrollLeft is 0)

  scroll = (offsetX, offsetY) ->
    if isScrollableElement currentlySelectedElement
      element = currentlySelectedElement
      while isElementScrolledToEnd offsetX, offsetY, element
        element = getClosestScrollable element.parentElement,
          (if offsetX isnt 0 then ':horizontally-scrollable' else ':vertically-scrollable')

      if isScrollableElement element
        generateWheelEvent element, offsetX, offsetY
      else
        scrollBy offsetX, offsetY
    else
      return scrollBy offsetX, offsetY if pageHasVerticalScroll()

      if offsetX isnt 0
        if biggestHorizontallyScrollable is undefined
          biggestHorizontallyScrollable = getBiggestScrollable ':horizontally-scrollable'
        if biggestHorizontallyScrollable
          generateWheelEvent biggestHorizontallyScrollable, offsetX, offsetY
      else # offsetY isnt 0
        if biggestVerticallyScrollable is undefined
          biggestVerticallyScrollable = getBiggestScrollable ':vertically-scrollable'
        if biggestVerticallyScrollable
          generateWheelEvent biggestVerticallyScrollable, offsetX, offsetY

  @top: ->
    if isScrollableElement currentlySelectedElement
      scroll 0, -currentlySelectedElement.scrollTop
    else
      scrollTo window.scrollX, 0
  desc @top, 'Scroll to the top of the page'

  @bottom: ->
    if isScrollableElement currentlySelectedElement
      scroll 0, currentlySelectedElement.scrollHeight
    else
      scrollTo window.scrollX, document.body.scrollHeight
  desc @bottom, 'Scroll to the bottom of the page'

  @first: -> scrollTo 0, window.scrollY if times(true, true) is 0
  desc @first, 'Scroll to the leftmost of the page'

  @last: -> scrollTo document.body.scrollWidth, window.scrollY
  desc @last, 'Scroll to the rightmost of the page'

  @up: -> scroll 0, times() * -VERTICAL_MOMENT
  desc @up, 'Scroll up'

  @down: -> scroll 0, times() * VERTICAL_MOMENT
  desc @down, 'Scroll down'

  @left: -> scroll times() * -HORIZONTAL_MOMENT, 0
  desc @left, 'Scroll left'

  @right: -> scroll times() * HORIZONTAL_MOMENT, 0
  desc @right, 'Scroll right'

  @nextPage: -> scroll 0, times() * window.innerHeight * 0.95
  desc @nextPage, 'Scroll down {count} full page'

  @prevPage: -> scroll 0, times() * -window.innerHeight * 0.95
  desc @prevPage, 'Scroll up {count} full page'

  @nextHalfPage: -> scroll 0, times() * window.innerHeight / 2
  desc @nextHalfPage, 'Scroll down {count} half page'

  @prevHalfPage: -> scroll 0, times() * -window.innerHeight / 2
  desc @prevHalfPage, 'Scroll up {count} half page'

  @toPercent: ->
    if isScrollableElement currentlySelectedElement
      scroll 0, currentlySelectedElement.scrollHeight * times(true) / 100
    else
      scrollTo window.scrollX, times(true) * $(document).height() / 100
  desc @toPercent, 'Scroll to {count}% of the page'
