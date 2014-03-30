class window.Scroll
  # TODO: doesn't work in some cases like http://bikesport.bg/en/products/965-sprint-radical-deluxe-27_5_quot_-hard-tail-mountain-bikes_
  # TODO: scrolling in iframes doesn't work - http://www.ikvm.net/

  [currentlySelectedElement, biggestVerticallyScrollable, biggestHorizontallyScrollable] = []

  [VERTICAL_MOMENT, HORIZONTAL_MOMENT] = [15, 15]

  elementWidth = (element) ->
    element.scrollWidth or $(element).width()

  elementHeight = (element) ->
    element.scrollHeight or $(element).height()

  isScrollableElement = (element) ->
    element and element not in [document.body, document.documentElement] and
      isElementVisible $(element), true

  getBiggestScrollable = (direction) ->
    biggestScrollable = null
    $(document.documentElement).find(direction).each (_, element) ->
      return unless isScrollableElement element
      area = elementWidth(element) * elementHeight(element)
      if biggestScrollable
        biggestArea = elementWidth(biggestScrollable) * elementHeight(biggestScrollable)
      else
        biggestArea = -1

      biggestScrollable = element if area > biggestArea
    biggestScrollable

  getClosestScrollable = (element, direction) ->
    $(element).closest(direction).get(0)

  $(document.documentElement).click (e) ->
    currentlySelectedElement = getClosestScrollable e.target, ':scrollable'

  getRealOffset = (element, offsetX, offsetY) ->
    $element = $(element)
    offsetX = elementWidth(element)  * Math.sign(offsetX) if Math.abs(offsetX) is Infinity
    offsetY = elementHeight(element) * Math.sign(offsetY) if Math.abs(offsetY) is Infinity
    [offsetX, offsetY]

  generateWheelEvent = (element, offsetX, offsetY) ->
    [offsetX, offsetY] = getRealOffset element, offsetX, offsetY

    event = document.createEvent 'WheelEvent'
    event.initWebKitWheelEvent -offsetX, -offsetY
    element.dispatchEvent event

  scrollBy = (offsetX, offsetY) ->
    [offsetX, offsetY] = getRealOffset document, offsetX, offsetY

    window.scrollBy offsetX, offsetY

  pageIsHorizontallyScrollable = ->
    $(document).width() > window.innerWidth

  pageIsVerticallyScrollable = ->
    $(document).height() > window.innerHeight

  scrollElement = (element, offsetX, offsetY) ->
    if isScrollableElement element
      generateWheelEvent element, offsetX, offsetY
    else
      scrollBy offsetX, offsetY

  isElementScrolledToEnd = (offsetX, offsetY, element) ->
    return no unless element

    $element = $(element)

    # hack to fix non-integer values for element height
    # example: http://userstyles.org/styles/36026/google-dark
    # element: div id="additional-info-text"
    $element.height $element.height()
    $element.width $element.width()

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

      scrollElement element, offsetX, offsetY
    else if offsetX isnt 0
      return scrollBy offsetX, offsetY if pageIsHorizontallyScrollable()

      if not isScrollableElement biggestHorizontallyScrollable
        biggestHorizontallyScrollable = getBiggestScrollable ':horizontally-scrollable'
      scrollElement biggestHorizontallyScrollable, offsetX, offsetY
    else # offsetY isnt 0
      return scrollBy offsetX, offsetY if pageIsVerticallyScrollable()

      if not isScrollableElement biggestVerticallyScrollable
        biggestVerticallyScrollable = getBiggestScrollable ':vertically-scrollable'
      scrollElement biggestVerticallyScrollable, offsetX, offsetY

  @top: -> scroll 0, -Infinity
  desc @top, 'Scroll to the top of the page'

  @bottom: -> scroll 0, Infinity
  desc @bottom, 'Scroll to the bottom of the page'

  @first: -> scroll -Infinity, 0 if times(true, true) is 0
  desc @first, 'Scroll to the leftmost of the page'

  @last: -> scroll Infinity, 0
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
      scroll 0, currentlySelectedElement.scrollHeight * times(true) / 100 - currentlySelectedElement.scrollTop
    else
      scrollTo window.scrollX, times(true) * $(document).height() / 100
  desc @toPercent, 'Scroll to {count}% of the page'
