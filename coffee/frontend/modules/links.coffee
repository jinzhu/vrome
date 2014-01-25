class Links
  open = (url) ->
    Post action: 'Tab.openUrl', url: url, newTab: (CmdBox.get().content.indexOf('!') isnt -1)

  @downloads: ->
    open 'chrome://downloads/'

  @history: ->
    open 'chrome://history/'

  @chrome_help: ->
    open 'chrome://help/'

  @bookmarks: ->
    open 'chrome://bookmarks/'

  @settings: ->
    open 'chrome://settings/'

  @extensions: ->
    open 'chrome://extensions/'

  @github: ->
    open 'https://github.com/jinzhu/vrome'

  @issues: ->
    open 'https://github.com/jinzhu/vrome/issues'

  @options: ->
    open '/background/html/options.html'

  for url in ['downloads', 'bookmarks', 'history', 'chrome_help', 'settings', 'extensions', 'github', 'issues', 'options']
    desc @[url], "Open #{url},! open in new page"

root = exports ? window
root.Links = Links
