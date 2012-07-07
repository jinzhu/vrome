var Marks = (function() {
  var gotoNewTab = false;
  var marks;

  function addQuickMark() {
    marks = Settings.get('url_marks') || {}
    Dialog.start('Add Quick Mark', '', filterQuickMarks, false, handleEnterKey);
  }

  function filterQuickMarks(string) {
    var sortedKeys = getFilteredMarks(string)

    // create data for dialog
    var cuteMarks = []
    _.each(sortedKeys, function(k) {
      cuteMarks.push({
        title: k,
        url: marks[k]
      })
    })

    Dialog.draw({
      urls: cuteMarks,
      keyword: ''
    })
  }

  function getFilteredMarks(keyword) {
    // marks starting by input
    var sortedKeys = _.filter(_.keys(marks), function(k) {
      return k.startsWith(keyword)
    })

    return sortedKeys.sort();
  }

  function handleEnterKey(e) {
    var key = getKey(e)
    var keyword = CmdBox.get().content

    if (isAcceptKey(key)) {
      // marks starting by input
      var sortedKeys = getFilteredMarks(keyword)

      // allow overwrite if it is the same mark
      if (sortedKeys.length > 0 && (sortedKeys.length !== 1 && sortedKeys[0] != keyword)) {
        // prevent the user from shooting himself in the foot and creating marks that he can't access
        CmdBox.set({
          title: "Conflict detected. Can't set mark `" + keyword + "` without blocking other marks"
        })
      } else {
        Post({
          action: "Marks.addQuickMark",
          key: keyword,
          url: window.location.href
        });
        Dialog.stop(true)
        CmdBox.set({
          title: "Added Quick Mark " + keyword,
          timeout: 2000
        })
      }

      return true;
    }

    return false;
  }

  function gotoQuickMark( /*Boolean*/ newtab) {
    marks = Settings.get('background.url_marks') || {}
    gotoNewTab = newtab
    var title = gotoNewTab ? 'Open Quick Mark (new tab)' : 'Open Quick Mark'
    Dialog.start(title, '', filterQuickMarks, newtab, handleGotoKeydown)
  }

  function handleGotoKeydown(e) {
    var key = getKey(e)
    var keyword = CmdBox.get().content

    var sortedKeys = getFilteredMarks(keyword)

    if (keyword.length > 0 && (isCtrlAcceptKey(key) || isAcceptKey(key) || sortedKeys.length === 1)) {
      var new_tab = gotoNewTab
      Dialog.stop(true)
      // limit to one mark unless it's control key then open all matches in new tabs
      if (isCtrlAcceptKey(key)) {
        new_tab = sortedKeys.length > 1
      } else {
        sortedKeys = [sortedKeys[0]]
      }

      // open marks
      _.each(sortedKeys, function(k) {
        var value = marks[k]
        if (value.startsWith('::javascript::')) {
          try {
            eval(value.replace('::javascript::', ''))
          } catch (e) {
            console.debug("failed to execute JS quick mark " + keyword, e);
          }

        } else {
          Post({
            action: "Tab.openUrl",
            urls: value,
            newtab: new_tab
          });
        }
      })

      return true;
    }

    return false;
  }

  function addLocalMark() {
    // TODO zoom
    var key = getKey(this);
    if (key.match(/^[A-Z]$/)) {
      Post({
        action: "Marks.addLocalMark",
        key: key,
        position: [scrollX, scrollY, location.href]
      });
    } else {
      var local_marks = Settings.get('hosts.local_marks') || {};
      local_marks[key] = [scrollX, scrollY];
      Settings.add('hosts.local_marks', local_marks)
    }
    CmdBox.set({
      title: "Added Local Mark " + key,
      timeout: 1000
    });
  }

  function gotoLocalMark() {
    var key = getKey(this);
    var setting_key = key.match(/^[A-Z]$/) ? 'background.local_marks' : 'hosts.local_marks';
    var position = key.match(/^[A-Z]$/) ? Settings.get(setting_key)[key] : Settings.get(setting_key, true)[key];
    if (position instanceof Array) {
      if (position[2]) {
        Post({
          action: "Tab.update",
          url: position[2],
          callback: "scrollTo(" + position[0] + "," + position[1] + ")"
        });
      } else {
        scrollTo(position[0], position[1]);
      }
    }
  }

  function deleteQuickMark(keyword) {
    marks = Settings.get('url_marks') || {}
    if (marks[keyword]) {
      delete marks[keyword]
      Settings.add('url_marks', marks);
    }
  }

  return {
    addQuickMark: addQuickMark,
    gotoQuickMark: gotoQuickMark,
    gotoQuickMarkNewTab: function() {
      gotoQuickMark.call(this, true);
    },
    addLocalMark: addLocalMark,
    gotoLocalMark: gotoLocalMark,
    deleteQuickMark: deleteQuickMark,
  };
})();
