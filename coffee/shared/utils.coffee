window.getLocalServerUrl = -> "http://127.0.0.1:#{Option.get('server_port')}"

window.desc = (func, description) ->
  func.description = description

window.fixRelativePath = (url, currentUrl) ->
  # http://google.com
  return url if url.isValidURL()

  location = document.createElement 'a'
  location.href = currentUrl or document.location.href

  # /admin
  return location.origin + url if url[0] is '/'

  # ../users || ./products || ../users
  url += '/' if url.endsWith '..'

  pathname = location.origin + location.pathname.replace(/\/+/g, '/')
  for path in url.split '..'
    if path[0] is '/'
      pathname = pathname.replace(/\/[^\/]*\/?$/, '') + path
    else if path.startsWith './'
      pathname = pathname.replace(/\/$/, '') + path.substr(1)
  pathname

# TODO: this shouldn't be here
window.openUrl = (url) ->
  chrome.tabs.query active: true, currentWindow: true, (tabs) ->
    Tab.openUrl url: url, newTab: true, active: true, tab: tabs[0]

window.openOptions = (params) ->
  url = "background/html/options.html#{if params then "##{params}" else ''}"
  openUrl chrome.extension.getURL(url)

window.isEditableElement = (element) ->
  element.nodeType is 1 and
    ($(element).is('input, textarea, select') or
      element.getAttribute('contenteditable')?)
