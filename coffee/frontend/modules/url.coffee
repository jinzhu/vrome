class window.Url
  @tabopen: => @open false, true
  desc @tabopen, 'Same as `o`, but open URLs or search in a new tab'

  @openWithDefault: => @open true, false
  desc @openWithDefault, 'Same as `o`, open URLs or search but edit current URL'

  @tabopenWithDefault: => @open true, true
  desc @tabopenWithDefault, 'Same as `t`, open URLs or search in a new tab but edit current URL'

  @open: (withDefault, newTab) ->
    title = if newTab then 'TabOpen: ' else 'Open: '
    content = if withDefault then location.href else (getSelected() or '')
    Dialog.start { title, content, search, newTab }
  desc @open, 'Open URLs or search'
  @open.options =
    noautocomplete:
      description: 'Disable autocomplete'
      example:     'set noautocomplete'
    searchengines:
      description: 'JSON of search engines'
      example:     'set searchengines={"google":"http://www.google.com/search?q={{keyword}}", "yahoo":"http://search.yahoo.com/search?p={{keyword}}"}'
    defaultsearch:
      description: 'Default search engine name'
      example:     'set defaultsearch=yahoo'
    autocomplete_prev:
      description: 'Select previous result'
      example:     'set autocomplete_prev=<Up>'
    autocomplete_next:
      description: 'Select next result'
      example:     'set autocomplete_prev=<Down>'
    autocomplete_next_10:
      description: 'Select next 10th result'
      example:     'set autocomplete_prev=<Tab>'
    autocomplete_prev_10:
      description: 'Select previous 10th result'
      example:     'set autocomplete_prev=<S-Tab>'

  search = (keyword) ->
    Post action: 'Tab.autoComplete', keyword: keyword

  @parent: ->
    pathnames = location.pathname.split('/')
    pathnames.pop() if pathnames[pathnames.length - 1] is ''

    hostnames = location.hostname.split('.')

    for i in [0...times()]
      if pathnames.length <= 1
        hostnames.shift() if hostnames.length > 2
      else
        pathnames.pop()

    hostname = hostnames.join '.'
    pathname = pathnames.join '/'
    port     = if location.port then ":#{location.port}" else ''

    Post action: 'Tab.openUrl', url: "#{location.protocol}//#{hostname}#{port}#{pathname}"
  desc @parent, 'Go to parent {count} URL'

  @root: -> location.pathname = '/'
  desc @root, 'Go to the root of the website'

  @tabReferer: => @referer true
  desc @tabReferer, 'Same as `gr`, but open in a new tab'

  @referer: (newTab=false) ->
    if document.referrer
      Post action: 'Tab.openUrl', url: document.referrer, newTab: newTab, active: true
  desc @referer, 'Go to the referrer'

  @decrement: => @increment -1
  desc @decrement, 'Decrement the last number in URL by {count}'

  @increment: (dirction) ->
    count = times() * (dirction or 1)

    if document.location.href.match /(.*?)(\d+)(\D*)$/
      [before, number, after] = [RegExp.$1, RegExp.$2, RegExp.$3]
      newNumber = parseInt(number, 10) + count
      newNumberStr = String(Math.max newNumber, 0)
      # 0009<C-a> -> 0010
      if /^0/.test number
        while newNumberStr.length < number.length
          newNumberStr = '0' + newNumberStr

      Post action: 'Tab.openUrl', url: before + newNumberStr + after
  desc @increment, 'Increment the last number in URL by {count}'

  @viewSourceNewTab: => @viewSource true
  desc @viewSourceNewTab, 'View source code in a new tab'

  @viewSource: (newTab) ->
    Post action: 'Tab.toggleViewSource', newTab: newTab
  desc @viewSource, 'View source code in current tab'

  @shortUrl: (msg) ->
    if msg?.url
      Clipboard.copy msg.url
      CmdBox.set title: "[Copied] Shortened URL: #{msg.url}", timeout: 4000
    else
      CmdBox.set title: 'Shortening current URL', timeout: 4000
      Post action: 'shortUrl'
  desc @shortUrl, 'Copy shorten URL to clipboard, the URL is shortened by `http://goo.gl`, You can use your account after grant auth in option page'

  @openFromClipboardAndFocusNewTab: => @openFromClipboard true, true
  desc @openFromClipboardAndFocusNewTab, 'Same as `p`, but open selected text or clipboard content in a new tab and activate it'

  @openFromClipboardNewTab: => @openFromClipboard true, false
  desc @openFromClipboardNewTab, 'Same as `p`, but open selected text or clipboard content in a new tab'

  @openFromClipboard: (newTab=false, active=false) ->
    selectedText = getSelected()
    if selectedText isnt ''
      Post { action: 'Tab.openUrl', url: selectedText, newTab, active }
    else
      Post { action: 'Tab.openFromClipboard', newTab, active }
  desc @openFromClipboard, 'Open selected text or clipboard content in current tab. If not a valid URL, make a search'
