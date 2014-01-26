class window.Mouse
  onClickHandlers = []

  @init: =>
    $body.on 'click', onClick

  @addOnClickHandler: (func) ->
    onClickHandlers.push func

  onClick = (e) ->
    func e for func in onClickHandlers
    return
