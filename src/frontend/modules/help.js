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
          text: 'Value',
          'class': 'help_optHeader'
        }),

        $('<td/>', {
          text: 'Description',
          'class': 'help_optHeader'
        }))
      },

      buildOptionHtml: function(optDesc, optName) {

        var defaultValue = Option.defaultOptions[optName]
        if (_.isArray(defaultValue)) {
          defaultValue = defaultValue.join(", ")
        } else if (_.isObject(defaultValue)) {
          defaultValue = JSON.stringify(defaultValue)
        }

        var optValue = Option.get(optName)
        optValue = (_.isArray(optValue) && optValue.join(", ")) || optValue
        optValue = (optValue == defaultValue && ' ') || optValue

        return $('<tr>').append(

        // option name
        $('<td/>', {
          text: optName,
          'class': 'help_optName'
        }),

        // option name
        $('<td/>', {
          text: defaultValue,
          'class': 'help_optDefault'
        }),

        // option value
        $('<td/>', {
          text: optValue,
          'class': 'help_optValue'
        }),

        // option description
        $('<td/>', {
          text: optDesc.firstLetterUpper().formatLineBreaks(),
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
        $('<table>').css({
          'margin-left': 10,
          'width': '100%'
        }).append($('<tr>').append(

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
        return $('<tr>').addClass('help_row').append(

        // has options
        $('<td/>', {
          text: (info.o && ' {O}') || '',
          'class': 'help_hasOptions'
        }),

        // server
        $('<td/>', {
          text: (info.s && ' {S}') || '',
          'class': 'help_server'
        }),

        // count
        $('<td/>', {
          text: (info.c && '{C}') || '',
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
      var ret = $('<table>')
      ret.addClass('help_optTable')

      // headers
      if (info.o) ret.append(HelpUtils.OptionUtils.buildOptionsHeadersHTML(info))

      // options
      _.each(info.o, function(optDesc, optName) {
        ret.append(HelpUtils.OptionUtils.buildOptionHtml(optDesc, optName))
      })

      return ret
    },

    buildCommandsHTML: function() {

      // table for all commands
      var ret = $('<table>')
      _.each(ncmds, function(commands, categoryName) {

        // table for current command
        var tbl = $('<table>')
        _.each(commands, function(info, commandName) {
          tbl.append(HelpUtils.CommandUtils.buildCommandHTML(info))
        })

        // main table
        ret.append(
        $('<tr>').append(

        $('<td>').append(
        // add category
        $('<h2/>', {
          'class': 'help_categoryTitle',
          text: categoryName.firstLetterUpper()

          // append commands to category
        }).append(tbl))))

      })

      return ret
    }

  }

  function buildContent() {

    var table = HelpUtils.buildCommandsHTML()

    var div = $('<div/>', {
      id: 'vrome_help_box',
      'class': 'hidden'
    })
    div.append(table)
    $(document.body).append(div)




    var height = screen.height * 2;
    var width = screen.width - 100;
    var a = $('<a/>', {
      href: '#TB_inline?height=' + height + '&width=' + width + '&inlineId=vrome_help_box&modal=true',
      'class': 'thickbox hidden'
    })
    $(document.body).append(a)

    tb_init_dom()

    setTimeout(function() {
      div.appendTo($('#fucker'))
      div.css({
        'position': 'absolute',
        'z-index': 2147483647,
        'background-color': 'black',
        'color': 'white'
      })
      div.show()
      //      Zoom.reset()
      //      clickElement(a[0])
    }, 100);
  }

  function transformCommands() {
    return cmds
  }

  function show() {
    ncmds = transformCommands()
    buildContent()
  }

  return {
    show: show,
    hide: function() {
      try {
        tb_remove()
      } catch (e) {}
    }
  };
})()
