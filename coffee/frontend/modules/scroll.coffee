class window.Scroll
  [currentlySelectedElement, biggestVerticallyScrollable, biggestHorizontallyScrollable] = []

  [VERTICAL_MOMENT, HORIZONTAL_MOMENT] = [15, 15]

  getElementHeight = (element) ->
    if element isnt document and
        (element.style.overflow in ['auto', 'hidden'] or element.style.height isnt '')

      element = $.clone element
      element.style.overflow = ''
      element.style.height = ''
      element.style.visibility = 'hidden'

      document.body.appendChild element
      removeElement = yes

    result = $(element).height()
    document.body.removeChild element if removeElement
    result

  getBiggestScrollable = (direction) ->
    biggestScrollable = null
    $body.find(direction).each (_, element) ->
      $element = $(element)

      area = $element.width() * getElementHeight(element)
      if biggestScrollable
        $biggestScrollable = $(biggestScrollable)
        biggestArea = $biggestScrollable.width() * getElementHeight(biggestScrollable)
      else
        biggestArea = -1

      biggestScrollable = element if area > biggestArea
    biggestScrollable

  getClosestScrollable = (element, direction) ->
    $(element).closest(direction).get(0)

  $(document.documentElement).click (e) ->
    clickedElement = document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset)
    currentlySelectedElement = getClosestScrollable clickedElement, ':scrollable'

  getRealOffset = (element, offsetX, offsetY) ->
    $element = $(element)
    offsetX = $element.width()          * Math.sign(offsetX) if Math.abs(offsetX) is Infinity
    offsetY = getElementHeight(element) * Math.sign(offsetY) if Math.abs(offsetY) is Infinity
    [offsetX, offsetY]

  generateWheelEvent = (element, offsetX, offsetY) ->
    return unless element

    [offsetX, offsetY] = getRealOffset element, offsetX, offsetY

    event = document.createEvent 'WheelEvent'
    event.initWebKitWheelEvent -offsetX, -offsetY
    element.dispatchEvent event

  scrollBy = (offsetX, offsetY) ->
    [offsetX, offsetY] = getRealOffset document, offsetX, offsetY

    window.scrollBy offsetX, offsetY

  pageIsHorizontallyScrollable = ->
    $(document).width() > $(window).width()

  pageIsVerticallyScrollable = ->
    $(document).height() > $(window).height()

  isScrollableElement = (element) ->
    element and element isnt document.body and element isnt document.documentElement

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
      if offsetX isnt 0
        return scrollBy offsetX, offsetY if pageIsHorizontallyScrollable()

        if biggestHorizontallyScrollable is undefined
          biggestHorizontallyScrollable = getBiggestScrollable ':horizontally-scrollable'
        generateWheelEvent biggestHorizontallyScrollable, offsetX, offsetY
      else # offsetY isnt 0
        return scrollBy offsetX, offsetY if pageIsVerticallyScrollable()

        if biggestVerticallyScrollable is undefined
          biggestVerticallyScrollable = getBiggestScrollable ':vertically-scrollable'
        generateWheelEvent biggestVerticallyScrollable, offsetX, offsetY

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
      scroll 0, currentlySelectedElement.scrollHeight * times(true) / 100
    else
      scrollTo window.scrollX, times(true) * $(document).height() / 100
  desc @toPercent, 'Scroll to {count}% of the page'
