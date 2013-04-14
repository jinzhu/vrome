class Help
  [ncmds, level] = [null, 0]

  @show: ->
    ncmds = transformCommands()
    $(document).ready =>
      @hide()
      buildContent()
  @show.description = "Open help page"

  @hide: (reset) ->
    level = Math.max [times(true, true), ++level]
    level = 0  if reset
    $("#vromeHelpBox, #vromeHelpOverlay").remove()

  buildContent = ->
    overlay = $("<div>", id: "vromeHelpOverlay")
    $(document.body).append overlay

    # table all commands
    table = HelpUtils.buildCommandsHTML()

    # add help box
    helpBox = $("<div/>", id: "vromeHelpBox")
    helpBox.append table
    $(document.body).append helpBox

    # resize overlay based on helpbox
    height = Math.max [helpBox.height(), $(document.body).height()]
    overlay.css height: height, width: "100%"


  transformCommands = ->
    [customMapping, reverseCustomMapping] = [Settings.get("@configure.map"), {}]

    reverseCustomMapping[value] = key for value, key in customMapping
    customKeys = (key for value, key in customMapping)

    unmap = Settings.get("@configure.unmap")
    unmappedKeys = (key for value, key in unmap)

    ncmds = CMDS.clone()
    bindings = KeyEvent.bindings.slice KeyEvent.coreBindingsIndex

    if customKeys or unmappedKeys
      for commands, categoryName in ncmds
        for info, fname in commands
          return  if info.gk

          keys = (binding[0] for binding in bindings when binding[1] is eval(fname))

          if typeof info.k is "string"
            keys.push info.k
          else
            keys = info.k

          keys.push reverseCustomMapping[k] for k in keys when reverseCustomMapping[k] isnt `undefined`

          keys = for k in keys
            ret = true
            # e.g map z zi where zi would now be blocked by z
            ret = false for cv, ck in customMapping when ck.length < k.length and k.startsWith(ck)
            ret and !(unmappedKeys.indexOf(k) or customKeys.indexOf(k))
          info.k = $.unique(keys)

    ncmds


  HelpUtils =
    OptionUtils:
      buildOptionsHeadersHTML: (info) ->
        hasDefaultOptions = false
        for optDesc, optName in info.o
          hasDefaultOptions = true  if not hasDefaultOptions and Option.defaultOptions[optName] isnt `undefined`

        $("<tr>").append $("<td>", text: "Name", class: "help_optHeader"),
          $("<td>", text: (hasDefaultOptions and "Default") or "", class: "help_optHeader"),
          $("<td>", html: "Value&nbsp;&nbsp;", class: "help_optHeader"),
          $("<td>", text: "Description", class: "help_optHeader")

      buildOptionHtml: (optDesc, optName) ->
        defaultValue = Option.defaultOptions[optName]
        defaultValue = stringify(defaultValue)
        optValue = stringify(Option.get(optName))
        optValue = (optValue is defaultValue and " ") or optValue
        defaultValue = defaultValue or ""  unless $.isNumeric(defaultValue)
        optValue = optValue or ""  unless $.isNumber(optValue)

        $("<tr>").append $("<td/>", text: optName, class: "help_optName"),
          $("<td/>", html: defaultValue.toString().formatLong(15, "help_optDefault"), class: "help_optDefault"),
          $("<td/>", html: optValue.toString().formatLong(15, "help_optValue"), class: "help_optValue"),
          $("<td/>", html: "&nbsp;" + optDesc.firstLetterUpper().formatLineBreaks(), class: "help_optDesc")

    CommandUtils:
      buildCommandDetailsHTML: (info) ->
        ret = $("<td>", class: "help_title", text: info.t.firstLetterUpper())
        description = (info.d and info.d.escape.formatLineBreaks()) or ""
        optsTable = HelpUtils.buildOptionsHTML(info)
        $("<table>").append($("<tr>").append($("<td/>",
          html: description
          class: (if level < 2 then "help_hidden" else "help_desc")
        )),
        $("<tr>").append($("<td>").text((info.o and "Options") or "").addClass((if level < 3 then "help_hidden" else "help_optsLabel")).append(optsTable))).appendTo ret
        ret

      buildCommandHTML: (info) ->
        keys = (((typeof info.k is "string") and info.k) or info.k.join(" ")).escape
        keys = "[NONE]" if keys.trim().length is 0

        $("<tr>").append $("<td/>",
          html: (info.o and "&nbsp; O") or "", class: "help_hasOptions"
        ), $("<td/>",
          html: (info.s and "&nbsp; S") or "", class: "help_server"
        ), $("<td/>",
          html: (info.c and "&nbsp;C") or "", class: "help_count"
        ), $("<td/>",
          html: keys + "&nbsp;", class: (if keys is "[NONE]" then "help_keyShortcutNone" else "help_keyShortcut")
        ), HelpUtils.CommandUtils.buildCommandDetailsHTML(info)

    buildOptionsHTML: (info) ->
      ret = $("<table>", id: "help_optsTable")
      ret.append HelpUtils.OptionUtils.buildOptionsHeadersHTML(info)  if info.o
      for optDesc, optName in info.o
        ret.append HelpUtils.OptionUtils.buildOptionHtml(optDesc, optName)

      if info.o
        ret.append $("<td/>", html: "<br/>")
      ret

    buildCommandsHTML: ->
      ret = $("<table>", id: "vromeHelpGiantTable")
      ret.append $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "C", class: "help_count"
      ), $("<td/>",
        html: "&nbsp;accepts count", class: "help_defaultColor"
      )), $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "S", class: "help_server"
      ), $("<td/>",
        html: "&nbsp;requires a server", class: "help_defaultColor"
      )), $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td/>",
        text: "O", class: "help_hasOptions"
      ), $("<td/>",
        html: "&nbsp;has options", class: "help_defaultColor"
      ))
      first = true
      for commands, categoryName in ncmds
        ret.append $("<tr>").append($("<td/>", html: not first and "<br/><br/>"))
        first = false
        ret.append $("<tr>").append($("<td/>"), $("<td/>"), $("<td/>"), $("<td/>"), $("<td>").append($("<h2/>",
          text: categoryName.firstLetterUpper()
        )).addClass("help_categoryTitle"))
        for info, commandName in commands
          ret.append HelpUtils.CommandUtils.buildCommandHTML(info)

      ret


root = exports ? window
root.Help = Help
