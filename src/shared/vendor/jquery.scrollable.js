var scrollAuto = ['scroll', 'auto'];

function cssIn($element, property) {
  return $.inArray($element.css(property), scrollAuto) != -1;
}

function verticallyScrollable(element) {
  $element = $(element);

  return element.clientHeight < element.scrollHeight && (
    cssIn($element, 'overflowY') || cssIn($element, 'overflow'));
}

function horizontallyScrollable(element) {
  $element = $(element);

  return element.clientWidth < element.scrollWidth && (
    cssIn($element, 'overflowX') || cssIn($element, 'overflow'));
}

(function($) {
  $.extend($.expr[':'], {
    'vertically-scrollable':   verticallyScrollable,
    'horizontally-scrollable': horizontallyScrollable,

    scrollable: function(element) {
      return verticallyScrollable(element) || horizontallyScrollable(element);
    }
  });
})(jQuery);
