var Tab = (function() {

  function copyUrl() {
    var url = document.location.href;
    Clipboard.copy(url);
    CmdBox.set({
      title: "[Copied] " + url,
      timeout: 4000
    });
  }

  function reload() {
    location.reload();
  }

  function reloadAll() {
    Post({
      action: "Tab.reloadAll"
    });
  }

  function reloadWithoutCache() {
    Post({
      action: "Tab.reloadWithoutCache"
    });
  }

  function unpinAll(option) {
    option = option || {};
    option.action = 'Tab.unpinAll';
    Post(option);
  }

  function move(option) {
    option.action = 'Tab.move';
    Post(option);
  }

  function close(option) {
    option = option || {};
    option.action = 'Tab.close';
    Post(option);
  }

  function reopen() {
    Post({
      action: "Tab.reopen",
      count: times()
    });
  }

  function togglePin() {
    Post({
      action: "Tab.togglePin"
    });
  }

  function duplicate() {
    Post({
      action: "Tab.duplicate",
      count: times()
    });
  }

  function detach() {
    Post({
      action: "Tab.detach"
    });
  }

  function openInIncognito() {
    Post({
      action: "Tab.openInIncognito"
    });
  }

  function markForMerging(opt) {
    opt = opt || {}
    opt.action = "Tab.markForMerging"
    Post(opt);
  }

  function merge() {
    Post({
      action: "Tab.merge"
    });
  }

  function mergeAll() {
    Post({
      action: "Tab.mergeAll"
    });
  }

  function selectPrevious() {
    var count = times( /*raw*/ true);

    if (count) {
      Post({
        action: "Tab.select",
        index: count - 1
      });
    } else {
      Post({
        action: "Tab.selectPrevious"
      });
    }
  }

  function selectLastOpen() {
    Post({
      action: "Tab.selectLastOpen",
      count: times()
    });
  }

  function prev() {
    Post({
      action: "Tab.select",
      offset: -1 * times()
    });
  }

  function next() {
    Post({
      action: "Tab.select",
      offset: times()
    });
  }

  function first() {
    Post({
      action: "Tab.select",
      index: 0
    });
  }

  function last() {
    Post({
      action: "Tab.select",
      index: -1
    });
  }

  // API
  return {
    copyUrl: copyUrl,
    reload: reload,
    reloadAll: reloadAll,
    reloadWithoutCache: reloadWithoutCache,

    close: close,
    closeAndFoucsLast: function() {
      close({
        type: 'focusLast',
        count: times()
      });
    },
    closeAndFoucsLeft: function() {
      close({
        offset: -1,
        count: times()
      });
    },
    closeOtherTabs: function() {
      close({
        type: 'closeOther'
      });
    },
    closeLeftTabs: function() {
      close({
        type: 'closeLeft'
      });
    },
    closeRightTabs: function() {
      close({
        type: 'closeRight'
      });
    },
    closePinnedTabs: function() {
      close({
        type: 'closePinned'
      });
    },
    closeUnPinnedTabs: function() {
      close({
        type: 'closeUnPinned'
      });
    },
    closeOtherWindows: function() {
      close({
        type: 'otherWindows'
      })
    },
    moveLeft: function() {
      move({
        direction: "left",
        count: times()
      })
    },

    moveRight: function() {
      move({
        direction: "right",
        count: times()
      })
    },

    reopen: reopen,
    unpinAllTabsInCurrentWindow: unpinAll,
    unpinAllTabsInAllWindows: function() {
      unpinAll({
        allWindows: true
      })
    },

    prev: prev,
    next: next,
    first: first,
    last: last,
    selectPrevious: selectPrevious,
    selectLastOpen: selectLastOpen,

    togglePin: togglePin,
    duplicate: duplicate,
    detach: detach,
    openInIncognito: openInIncognito,
    merge: merge,
    mergeAll: mergeAll,
    markForMerging: markForMerging,
    markAllForMerging: function() {
      markForMerging({
        all: true
      });
    },
    putMarkedTabs: function() {
      Post({
        action: "Tab.putMarkedTabs"
      })
    }
  };
})();
