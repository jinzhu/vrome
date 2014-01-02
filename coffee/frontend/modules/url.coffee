class Url

  @tabopen: => @open(false, true)
  desc @tabopen, "Same as `o`, but open URLs or search in a new tab"

  @openWithDefault: => @open(true, false)
  desc @openWithDefault, "Same as `o`, Open URLs or search (edit current URL)"

  @tabopenWithDefault: => @open(true, true)
  desc @tabopenWithDefault, "Same as `o`, but open URLs or search in a new tab (edit current URL)"

  @open: (with_default, new_tab) ->
    title = (if new_tab then 'TabOpen: ' else 'Open: ')
    content = (if with_default then location.href else (getSelected() || ''))
    Dialog.start title: title, content: content, search: search, newtab: new_tab
  desc @open, "Open URLs or search"
  @open.options = {
    noautocomplete: {
      description: "Disable autocomplete"
      example: "set noautocomplete"
    }
    searchengines: {
      description: "JSON of search engines"
      example: 'set searchengines={"google":"http://www.google.com/search?q={{keyword}}", "yahoo":"http://search.yahoo.com/search?p={{keyword}}"}'
    }
    defaultsearch: {
      description: "Default search engine name"
      example: 'set defaultsearch=yahoo'
    }
    autocomplete_prev: {
      description: "Select previous result"
      example: 'set autocomplete_prev=<Up>'
    }
    autocomplete_next: {
      description: "Select next result"
      example: 'set autocomplete_prev=<Down>'
    }
    autocomplete_next_10: {
      description: "Select next 10th result"
      example: 'set autocomplete_prev=<Tab>'
    }
    autocomplete_prev_10: {
      description: "Select previous 10th result"
      example: 'set autocomplete_prev=<S-Tab>'
    }
  }


  search = (keyword) ->
    Post action: "Tab.autoComplete", keyword: keyword, default_urls: fixUrl(keyword)

  @fixRelativePath= (url) ->
    # http://google.com
    return url if /:\/\//.test(url)

    # /admin
    return document.location.origin + url if (/^\//.test(url))

    # ../users || ./products || ../users
    url += '/' if url.match(/\/?\.\.$/) # .. -> ../

    pathname = document.location.origin + document.location.pathname.replace(/\/+/g, '/')
    for path in url.split('..')
      if path.match(/^\//)
        pathname = pathname.replace(/\/[^\/]*\/?$/, '') + path
      else if path.match(/^.\//)
        pathname = pathname.replace(/\/$/, '') + path.replace(/^.\//, '/')
    pathname


  fixUrl = (url_str) =>
    urls = url_str.split(", ")
    result = []

    for url in urls
      url = url.trim()
      # file://xxxxx || http://xxxxx
      if (/:\/\//.test(url))
        result.push(url)
      #  /jinzhu || (.. || ./configure) && no space
      else if (/^\//.test(url) || /^\.\.?\/?/.test(url)) && /^\s*\S+\s*$/.test(url)
        result.push(@fixRelativePath(url))
      # Like url, for example: google.com
      else if /\w+\.\w+/.test(url) && !/\s/.test(url)
        result.push "#{if url.match("://") then "" else "http://"}#{url}"
      # Local URL, for example: localhost:3000 || dev.local/
      else if /local(host)?($|\/|\:)/.test(url)
        result.push "#{if url.match("://") then "" else "http://"}#{url}"
      # google vrome
      else
        searchengines = Option.get('searchengines')
        name = url.replace(/^(\S+)\s.*$/, "$1"); # searchengine name: e.g: google
        keyword = encodeURIComponent url.replace(/^\S+\s+(.*)$/, "$1")

        # use the matched searchengine
        if searchengines[name]
          result.push searchengines[name].replace "{{keyword}}", keyword
          break

        url = encodeURIComponent(url)
        result.push Option.default_search_url(url)

    result


  @parent: ->
    pathnames = location.pathname.split('/')
    pathnames = pathnames[0 .. -2] if pathnames[pathnames.length - 1] is ''

    hostnames = location.hostname.split('.')

    for i in [0...times()]
      if pathnames.length <= 1
        hostnames.shift() if hostnames.length > 2
      else
        pathnames.pop()

    hostname = hostnames.join('.')
    pathname = pathnames.join('/')
    port = (if location.port then (':' + location.port) else '')

    Post action: "Tab.openUrl", url: "#{location.protocol}//#{hostname}#{port}#{pathname}"
  desc @parent, "Go to parent {count} URL"


  @root: ->
    location.pathname = '/'
  desc @root, "Go to the root of the website"

  @tabReferer: => @referer true
  desc @tabReferer, "Same as `gr`, But open in new tab"

  @referer: (newtab=false) ->
    if document.referrer
      Post action: "openOrSelectUrl", url: document.referrer, newtab: newtab, selected: true
  desc @referer, "Go to the referer"

  @decrement: => @increment(-1)
  desc @decrement, "Decrement the last number in URL by {count}"

  @increment: (dirction) ->
    count = times() * (dirction || 1)

    if document.location.href.match(/(.*?)(\d+)(\D*)$/)
      [before, number, after] = [RegExp.$1, RegExp.$2, RegExp.$3]
      newNumber = parseInt(number, 10) + count
      newNumberStr = String(if newNumber > 0 then newNumber else 0)
      # 0009<C-a> -> 0010
      if number.match(/^0/)
        while newNumberStr.length < number.length
          newNumberStr = "0" + newNumberStr

      Post action: "Tab.openUrl", url: before + newNumberStr + after
  desc @increment, "Increment the last number in URL by {count}"


  @viewSourceNewTab: => @viewSource true
  desc @viewSourceNewTab, "View source code in new tab"

  @viewSource: (newTab) ->
    Post action: "Tab.toggleViewSource", newtab: newTab
  desc @viewSource, "View source code in current tab"

  @shortUrl: (msg) ->
    if msg?.url
      Clipboard.copy(msg.url)
      CmdBox.set title: "[Copied] Shortened URL: #{msg.url}", timeout: 4000
    else
      CmdBox.set title: 'Shortening current URL', timeout: 4000
      Post action: "shortUrl"
  desc @shortUrl, "Copy shorten URL to clipboard, the URL is shortened by `http://goo.gl`, You can use your account after grand auth in option page"


  @openFromClipboardAndFocusNewTab: => @openFromClipboard(true, true)
  desc @openFromClipboardAndFocusNewTab, "Same as `p`, but open selected text or clipboard content in new tab and active it"

  @openFromClipboardNewTab: => @openFromClipboard(true)
  desc @openFromClipboardNewTab, "Same as `p`, but open selected text or clipboard content in new tab"

  @openFromClipboard: (new_tab=false, selected=false) ->
    selected_value = getSelected()
    if selected_value isnt ""
      Post action: "Tab.openUrl", url: fixUrl(selected_value), newtab: new_tab, selected: selected
    else
      Post action: "Tab.openFromClipboard", newtab: new_tab, selected: selected

  desc @openFromClipboard, "Open selected text or clipboard content in current tab. If not a valid URL, make a search"


root = exports ? window
root.Url = Url
