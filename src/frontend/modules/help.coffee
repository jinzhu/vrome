Help = (->
  
  # transformed commands (includes custom mapping)
  
  # level of details
  # 1 = simple
  # 2 = description
  # 3 = options
  
  # hide default column if we don't have default options pre-defined
  
  # option name
  
  # option default
  
  # option value
  
  # option description
  
  # table for description + options
  
  # description
  
  # create options label + append options table
  
  # row for a command
  
  # has options
  
  # server
  
  # count
  
  # keys
  
  # title + description + options
  
  # options associated to command -- build table
  
  # headers
  
  # options
  
  # table for all commands
  
  # add legend
  
  # skip break line for first category
  
  # table for current command
  
  # add category
  
  # main table
  buildContent = ->
    
    # add overlay
    overlay = $("<div/>",
      id: "vromeHelpOverlay"
    )
    $(document.body).append overlay
    
    # table all commands
    table = HelpUtils.buildCommandsHTML()
    
    # add help box
    helpBox = $("<div/>",
      id: "vromeHelpBox"
    )
    helpBox.append table
    $(document.body).append helpBox
    
    # resize overlay based on helpbox
    height = helpBox.height()
    height = $(document.body).height()  if $(document.body).height() > height
    overlay.css
      height: height
      width: "100%"

  transformCommands = ->
    
    # update mapping using custom mapping
    customMapping = Settings.get("configure.map")
    reverseCustomMapping = {}
    _.map customMapping, (v, k) ->
      reverseCustomMapping[v] = k

    customKeys = _.keys(customMapping)
    unmap = Settings.get("configure.unmap")
    unmappedKeys = unmap and _.keys(unmap)
    ncmds = _.clone(cmds)
    bindings = KeyEvent.bindings
    bindings = bindings.slice(KeyEvent.coreBindingsIndex)
    if customKeys or unmappedKeys
      _.each ncmds, (commands, categoryName) ->
        _.each commands, (info, fname) ->
          return  if info.gk
          keys = []
          
          # add bindings added through custom JS
          _.each bindings, (binding) ->
            keys.push binding[0]  if binding[1] is eval_(fname)

          
          # get keys
          if _.isString(info.k)
            keys.push info.k
          else
            keys = info.k
          _.each keys, (k) ->
            keys.push reverseCustomMapping[k]  if reverseCustomMapping[k] isnt `undefined`

          keys = _.uniq(keys)
          
          # remove unmapped keys
          keys = _.filter(keys, (k) ->
            ret = true
            _.each customMapping, (cv, ck) ->
              
              # remove keys blocking other keys
              # e.g map z zi where zi would now be blocked by z
              
              # remove keys that are already mapped
              # e.g map gf G
              # map gs gf
              # we don't want gf to appear in gs because it is already mapped to G
              ret = false  if (ck isnt k and ck.length < k.length and k.toString().startsWith(ck)) or (ck is k and reverseCustomMapping[ck] isnt `undefined` and _.include(keys, reverseCustomMapping[ck]))

            ret = ret and (not _.include(unmappedKeys, k) or _.include(customKeys, k))
            ret
          )
          info.k = keys


    ncmds
  show = ->
    ncmds = transformCommands()
    $(document).ready ->
      Help.hide()
      buildContent()

  hide = (reset) ->
    level++
    level = times(true, true)  if times(true, true) > level
    level = 0  if reset
    $("#vromeHelpBox").remove()
    $("#vromeHelpOverlay").remove()
  ncmds = undefined
  level = 0
  HelpUtils =
    OptionUtils:
      buildOptionsHeadersHTML: (info) ->
        hasDefaultOptions = false
        _.each info.o, (optDesc, optName) ->
          hasDefaultOptions = true  if not hasDefaultOptions and Option.defaultOptions[optName] isnt `undefined`

        $("<tr>").append $("<td/>",
          text: "Name"
          class: "help_optHeader"
        ), $("<td/>",
          text: (hasDefaultOptions and "Default") or ""
          class: "help_optHeader"
        ), $("<td/>",
          html: "Value&nbsp;&nbsp;"
          class: "help_optHeader"
        ), $("<td/>",
          text: "Description"
          class: "help_optHeader"
        )

      buildOptionHtml: (optDesc, optName) ->
        defaultValue = Option.defaultOptions[optName]
        defaultValue = stringify(defaultValue)
        optValue = Option.get(optName)
        optValue = stringify(optValue)
        optValue = (optValue is defaultValue and " ") or optValue
        defaultValue = defaultValue or ""  unless _.isNumber(defaultValue)
        optValue = optValue or ""  unless _.isNumber(optValue)
        $("<tr>").append $("<td/>",
          text: optName
          class: "help_optName"
        ), $("<td/>",
          html: defaultValue.toString().formatLong(15, "help_optDefault")
          class: "help_optDefault"
        ), $("<td/>",
          html: optValue.toString().formatLong(15, "help_optValue")
          class: "help_optValue"
        ), $("<td/>",
          html: "&nbsp;" + optDesc.firstLetterUpper().formatLineBreaks()
          class: "help_optDesc"
        )

    CommandUtils:
      buildCommandDetailsHTML: (info) ->
        ret = $("<td>")
        ret.addClass "help_title"
        ret.text info.t.firstLetterUpper()
        description = (info.d and _.escape(info.d).formatLineBreaks()) or ""
        optsTable = HelpUtils.buildOptionsHTML(info)
        $("<table>").append($("<tr>").append($("<td/>",
          html: description
          class: (if level < 2 then "help_hidden" else "help_desc")
        )), $("<tr>").append($("<td>").text((info.o and "Options") or "").addClass((if level < 3 then "help_hidden" else "help_optsLabel")).append(optsTable))).appendTo ret
        ret

      buildCommandHTML: (info) ->
        keys = _.escape(((_.isString(info.k) and info.k) or info.k.join(" ")))
        keys = "[NONE]"  if keys.trim().length is 0
        $("<tr>").append $("<td/>",
          html: (info.o and "&nbsp; O") or ""
          class: "help_hasOptions"
        ), $("<td/>",
          html: (info.s and "&nbsp; S") or ""
          class: "help_server"
        ), $("<td/>",
          html: (info.c and "&nbsp;C") or ""
          class: "help_count"
        ), $("<td/>",
          html: keys + "&nbsp;"
          class: (if keys is "[NONE]" then "help_keyShortcutNone" else "help_keyShortcut")
        ), HelpUtils.CommandUtils.buildCommandDetailsHTML(info)

    buildOptionsHTML: (info) ->
      ret = $("<table>",
        id: "help_optsTable"
      )
      ret.append HelpUtils.OptionUtils.buildOptionsHeadersHTML(info)  if info.o
      _.each info.o, (optDesc, optName) ->
        ret.append HelpUtils.OptionUtils.buildOptionHtml(optDesc, optName)

      if info.o
        ret.append $("<td/>",
          html: "<br/>"
        )
      ret

    buildCommandsHTML: ->
      ret = $("<table>",
        id: "vromeHelpGiantTable"
      )
      ret.append $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "C"
        class: "help_count"
      ), $("<td/>",
        html: "&nbsp;accepts count"
        class: "help_defaultColor"
      )), $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "S"
        class: "help_server"
      ), $("<td/>",
        html: "&nbsp;requires a server"
        class: "help_defaultColor"
      )), $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "O"
        class: "help_hasOptions"
      ), $("<td/>",
        html: "&nbsp;has options"
        class: "help_defaultColor"
      ))
      first = true
      _.each ncmds, (commands, categoryName) ->
        ret.append $("<tr>").append($("<td/>",
          html: not first and "<br/><br/>"
        ))
        first = false
        ret.append $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td>").append($("<h2/>",
          text: categoryName.firstLetterUpper()
        )).addClass("help_categoryTitle"))
        _.each commands, (info, commandName) ->
          ret.append HelpUtils.CommandUtils.buildCommandHTML(info)


      ret

  show: show
  hide: hide
)()
