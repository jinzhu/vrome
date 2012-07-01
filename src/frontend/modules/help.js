var Help = (function() {

  // transformed commands (includes custom mapping)
  var ncmds;

  var HelpUtils = {
    OptionUtils: {
      buildOptionsHeadersHTML: function(info) {
        // hide default column if we don't have default options pre-defined
        var hasDefaultOptions = false;
        _.each(info.o, function(optDesc, optName) {
          if (!hasDefaultOptions && Option.defaultOptions[optName] !== undefined) {
            hasDefaultOptions = true;
          }
        })

        return $('<tr>').append(

        $('<td/>', {
          text: 'Name',
          'class': 'help_optHeader'
        }),

        $('<td/>', {
          text: (hasDefaultOptions && 'Default') || '',
          'class': 'help_optHeader'
        }),

        $('<td/>', {
          html: 'Value&nbsp;&nbsp;',
          'class': 'help_optHeader'
        }),

        $('<td/>', {
          text: 'Description',
          'class': 'help_optHeader'
        }))
      },

      buildOptionHtml: function(optDesc, optName) {

        var defaultValue = Option.defaultOptions[optName]
        defaultValue = stringify(defaultValue)

        var optValue = Option.get(optName)
        optValue = stringify(optValue)
        optValue = (optValue == defaultValue && ' ') || optValue

        if (!_.isNumber(defaultValue)) defaultValue = defaultValue || ""

        if (!_.isNumber(optValue)) optValue = optValue || ""

        return $('<tr>').append(

        // option name
        $('<td/>', {
          text: optName,
          'class': 'help_optName'
        }),

        // option default
        $('<td/>', {
          html: defaultValue.toString().formatLong(15, 'help_optDefault'),
          'class': 'help_optDefault'
        }),

        // option value
        $('<td/>', {
          html: optValue.toString().formatLong(15, 'help_optValue'),
          'class': 'help_optValue'
        }),

        // option description
        $('<td/>', {
          html: '&nbsp;' + optDesc.firstLetterUpper().formatLineBreaks(),
          'class': 'help_optDesc'
        }))
      }
    },

    CommandUtils: {

      buildCommandDetailsHTML: function(info) {
        var ret = $('<td>')
        ret.addClass('help_title')
        ret.text(info.t.firstLetterUpper())

        var description = (info.d && _.escape(info.d).formatLineBreaks()) || ''
        var optsTable = HelpUtils.buildOptionsHTML(info)

        // table for description + options
        $('<table>').append($('<tr>').append(

        // description
        $('<td/>', {
          html: description,
          'class': 'help_desc'
        })), $('<tr>').append(

        // create options label + append options table
        $('<td>').text((info.o && 'Options') || '').addClass('help_optsLabel').append(optsTable))).appendTo(ret)

        return ret
      },

      buildCommandHTML: function(info) {

        var keys = _.escape(((_.isString(info.k) && info.k) || info.k.join(" ")))

        // row for a command
        return $('<tr>').append(

        // has options
        $('<td/>', {
          html: (info.o && '&nbsp; O') || '',
          'class': 'help_hasOptions'
        }),

        // server
        $('<td/>', {
          html: (info.s && '&nbsp; S') || '',
          'class': 'help_server'
        }),

        // count
        $('<td/>', {
          html: (info.c && '&nbsp;C') || '',
          'class': 'help_count'
        }),

        // keys
        $('<td/>', {
          html: keys + '&nbsp;',
          'class': 'help_keyShortcut'
        }),

        // title + description + options
        HelpUtils.CommandUtils.buildCommandDetailsHTML(info))
      }

    },

    // options associated to command -- build table
    buildOptionsHTML: function(info) {
      var ret = $('<table>', {
        id: 'help_optsTable'
      })

      // headers
      if (info.o) ret.append(HelpUtils.OptionUtils.buildOptionsHeadersHTML(info))

      // options
      _.each(info.o, function(optDesc, optName) {
        ret.append(HelpUtils.OptionUtils.buildOptionHtml(optDesc, optName))
      })

      if (info.o) ret.append($('<td/>', {
        html: '<br/>'
      }))

      return ret
    },

    buildCommandsHTML: function() {

      // table for all commands
      var ret = $('<table>', {
        id: 'vromeHelpGiantTable'
      })
      _.each(ncmds, function(commands, categoryName) {

        // table for current command
        ret.append(
        $('<tr>').append(
        $('<td/>', {
          html: '<br/><br/>'
        })))

        ret.append(
        $('<tr>').append(
        $('<td/>'), $('<td/>'), $('<td/>'), $('<td/>'),

        $('<td>').append(
        // add category
        $('<h2/>', {
          text: categoryName.firstLetterUpper()
        })).addClass('help_categoryTitle')))

        _.each(commands, function(info, commandName) {
          ret.append(HelpUtils.CommandUtils.buildCommandHTML(info))
        })
        // main table
      })

      return ret
    }
  }

  function buildContent() {
    Help.hide()

    // add overlay
    var overlay = $('<div/>', {
      id: 'vromeHelpOverlay'
    })
    $(document.body).append(overlay)

    // table all commands
    var table = HelpUtils.buildCommandsHTML()

    // add help box
    var helpBox = $('<div/>', {
      id: 'vromeHelpBox'
    })
    helpBox.append(table)
    $(document.body).append(helpBox)

    // resize overlay based on helpbox
    var height = helpBox.height();
    if($(document.body).height() > height)
      height = $(document.body).height()

    overlay.css({
      height: height,
      width: '100%'
    })
  }

  function transformCommands() {
    return cmds
  }

  function show() {
    ncmds = transformCommands()
    $(document).ready(function() {
      buildContent()
    });
  }

  function hide() {
    $('#vromeHelpBox').remove()
    $('#vromeHelpOverlay').remove()
  }

  return {
    show: show,
    hide: hide
  }
})()
