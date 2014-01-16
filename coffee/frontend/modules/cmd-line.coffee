class CmdLine
  commands = {}

  @add: (name, func, hasArgs) ->
    commands[name] = {name, description: func?.description, func, hasArgs}

  @start: ->
    Dialog.start title: 'Command-line', search: search, onTab: onTabFunc
  desc @start, 'Start command line'

  onClickFunc = (command) ->
    (e) ->
      [title, keywords] = [$(e.target).attr('title'), CmdBox.get().content.split(' ')]
      content = [title, keywords[1..-1].join(' ')].join(' ')
      CmdBox.softSet {content}
      command.func.call '', keywords[1..-1].join(' ')
      Dialog.stop()
      false

  onSelectFunc = (e) ->
    [title, content] = [$(e.target).attr('title') + ' ', CmdBox.get()._content.trim()]
    if title.startsWith(content) and not content.startsWith title.trim()
      CmdBox.softSet content: title, selection: title.trimFirstStr(content)

  onTabFunc = (e) ->
    if CmdBox.get().selection?.length
      CmdBox.softSet content: CmdBox.get().content, selectLast: true
      return true

    [title, contents] = [Dialog.current()?.attr('title') or '', CmdBox.get().content.split(' ')]
    if not title.startsWith contents[0]
      contents[0] = title
      CmdBox.softSet content: contents.join(' ').trim() + ' '
      return true

    false

  search = ->
    keyword = CmdBox.get()._content
    cmd = keyword.split(' ').shift()

    available = []
    addToAvailable = (command) ->
      available.push command if command not in available
    addToAvailable command for key, command of commands when key.startsWith cmd
    addToAvailable command for key, command of commands when key.indexOf(cmd) isnt -1
    regexp = RegExp cmd.split('').join('.*'), 'i'
    addToAvailable command for key, command of commands when regexp.test key
    addToAvailable command for key, command of commands when regexp.test command.description

    cuteCommands = for command in available
      title:       command.name
      description: command.description
      onClick:     onClickFunc command
      onSelect:    onSelectFunc
    Dialog.draw urls: cuteCommands, keyword: ''

root = exports ? window
root.CmdLine = CmdLine
