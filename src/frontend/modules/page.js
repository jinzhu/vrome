var Page = (function() {
  function hideImages() {
    var imgs = document.getElementsByTagName('img')
    _.each(imgs, function(v) {
      // toggle class name
      $(v).toggleClass('help_hidden')
    })
  }

  function execMatch(regexps) {
    var elems = document.getElementsByTagName('a');
    for (var i = 0; i < regexps.length; i++) {
      for (var j = 0; j < elems.length; j++) {
        if (new RegExp(regexps[i], 'i').test((elems[j].innerText || '').replace(/(^(\n|\s)+|(\s|\n)+$)/, ''))) {
          return clickElement(elems[j]);
        }
      }
    }

    return false;
  }

  function copySelected() {
    var text = getSelected();
    Clipboard.copy(text);
    text = text.length > 80 ? (text.slice(0, 80) + "...") : text;
    CmdBox.set({
      title: '[Copied]' + text,
      timeout: 4000
    });
  }

  function styleDisable() {
    var cssFile = Option.get('chrome_custom_css_file') || Option.get('ccc_file')
    if (cssFile) {
      $.ajax({
        type: "POST",
        url: getLocalServerUrl(),
        data: JSON.stringify({
          method: 'switch_chrome_css',
          filename: cssFile
        })
      }).done(function(data) {
        if (data) {
          CmdBox.set({
            title: data,
            timeout: 1000
          })
        }
      })
    }
  }

  function transformURLs() {
    document.body.innerHTML = document.body.innerHTML.transformURL()
  }

  function openURLs(args) {
    if (args.split(' ').length !== 2) {
      CmdBox.set({
        title: "Usage: dld-links [match] [begin;end]<br/> e.g dld-links mp4 3;20"
      })

      return false;
    }

    var match = args.split(' ')[0]
    var pagination = args.split(' ')[1]
    var begin = parseInt(pagination.split(';')[0])
    var end = parseInt(pagination.split(';')[1])

    var all = document.getElementsByTagName('a');
    all = _.filter(all, function(v) {
      return v.href && v.href.indexOf(match) !== -1;
    })

    _.each(all, function(v, k) {
      if (!((k + 1) >= begin && (k + 1) <= end)) return;
      clickElement(v, {
        ctrl: true
      })
    })

    return true;
  }

  function editURLInExternalEditor() {
    Post({
      action: "Editor.open",
      data: window.location.href,
      callbackAction: 'Page.editURLExternalEditorCallback'
    });
  }

  function editURLExternalEditorCallback(msg) {
    if (window.location.href != msg.value) {
      window.location.href = msg.value
    }
  }

  return {
    next: function() {
      execMatch(Option.get('nextpattern'));
    },
    prev: function() {
      execMatch(Option.get('previouspattern'));
    },
    copySelected: copySelected,
    styleDisable: styleDisable,
    transformURLs: transformURLs,
    openURLs: openURLs,
    editURLInExternalEditor: editURLInExternalEditor,
    editURLExternalEditorCallback: editURLExternalEditorCallback,
    openOptions: function() {
      Post({
        action: "Tab.openUrl",
        urls: "/background/options.html",
        newtab: true
      });
    },

    hideImages: hideImages
  };
})();
