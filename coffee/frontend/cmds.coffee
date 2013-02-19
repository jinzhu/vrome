# Commands are categorized (e.g global, tabs, page etc)
# legend for attributes
###
t  = title
d  = description
k  = keys (array or string)
gk = generated keys -- we use a function to determine the keys associated to that function
s  = server required (boolean 1/0)
o  = associated options
 d = option description
 e = option example
c  = count/times is supported (boolean 1/0)
m  = ["i", "n"] // support modes, i => insert mode, n => normal mode, default normal mode
i  = true // ignore this command in help page
###

root = exports ? window

root.AcceptKey = ["<Enter>", "<C-j>", "<C-m>"]
root.CancelKey = ["<Esc>", "<C-[>"]
root.CtrlEscapeKey = ["<C-Esc>"]

CMDS =
  global:
    "Help.show":
      t: "Open help page (Press <F1> again to expand more details, Again for options)"
      k: "<F1>"
      m: ["i", "n"]
      c: 1

    "CmdLine.start":
      t: "Start command line"
      k: ":"

    "AcceptKeyFunction":
      t: "Submit input"
      k: AcceptKey
      m: ["i", "n"]
      i: true

    "CancelKeyFunction":
      t: "Cancel action"
      k: CancelKey
      m: ["i", "n"]

    "CtrlEscapeKeyFunction":
      t: "Enable Vrome when in pass-through"
      k: CtrlEscapeKey
      m: ["i", "n"]

    "Dialog.openCurrentNewTab":
      t: "Open selected URL in new tab"
      d: "When in a dialog, Open selected URL (highlighted background) in a new tab"
      k: "<C-Enter>"
      m: ["i", "n"]

    "KeyEvent.disable":
      t: "Disable vrome"
      d: "Ignore all keys passed to vrome - use <C-ESC> to enable it"
      k: "<C-z>"
      o:
        disablesites: {
          d: "Disable Vrome in those sites, Multiple URLs can be separated with ','"
          e: "set disablesites=mail.google.com, reader.google.com"
        }
        enable_vrome_key: {
          d: "Key to enable Vrome again"
          e: "set enable_vrome_key=<Esc>"
        }

    "KeyEvent.passNextKey":
      t: "Pass next key"
      k: "<C-v>"

    "KeyEvent.runLast":
      t: "Repeat the last command"
      k: "."
      c: 1

  zoom:
    "Zoom.current_in":
      t: "Zoom in, based on the beginning of the screen"
      k: "zi"
      c: 1

    "Zoom.current_out":
      t: "Zoom out, based on the beginning of the screen"
      k: "zo"
      c: 1

    "Zoom.current_more":
      t: "x3 Zoom in, based on the beginning of the screen"
      k: "zm"
      c: 1

    "Zoom.current_reduce":
      t: "x3 Zoom out, based on the beginning of the screen"
      k: "zr"
      c: 1

    "Zoom.current_reset":
      t: "Zoom reset, based on the beginning of the screen"
      k: "zz"

    "Zoom.zoomIn":
      t: "Zoom in, based on the center of the screen"
      k: "zI"
      c: 1

    "Zoom.out":
      t: "Zoom out, based on the center of the screen"
      k: "zO"
      c: 1

    "Zoom.more":
      t: "3x Zoom in, based on the center of the screen"
      k: "zM"
      c: 1

    "Zoom.reduce":
      t: "3x Zoom out, based on the center of the screen"
      k: "zR"
      c: 1

    "Zoom.reset":
      t: "Zoom reset, based on the center of the screen"
      k: "zZ"

  scroll:
    "Scroll.top":
      t: "Scroll to the top of the page"
      k: "gg"

    "Scroll.bottom":
      t: "Scroll to the bottom of the page"
      k: "G"

    "Scroll.first":
      t: "Scroll to the left of the page"
      k: "0"

    "Scroll.last":
      t: "Scroll to the right of the page"
      k: "$"

    "Scroll.toPercent":
      t: "Scroll to {count}% of the page"
      k: "%"
      c: 1

    "Scroll.up":
      t: "Scroll up"
      k: "k"
      c: 1

    "Scroll.down":
      t: "Scroll down"
      k: "j"
      c: 1

    "Scroll.left":
      t: "Scroll left"
      k: "h"
      c: 1

    "Scroll.right":
      t: "Scroll right"
      k: "l"
      c: 1

    "Scroll.nextPage":
      t: "Scroll down {count} full page"
      k: "<C-f>"
      c: 1

    "Scroll.prevPage":
      t: "Scroll up {count} full page"
      k: "<C-b>"
      c: 1

    "Scroll.nextHalfPage":
      t: "Scroll down {count} half page"
      k: "<C-d>"
      c: 1

    "Scroll.prevHalfPage":
      t: "Scroll up {count} half page"
      k: "<C-u>"
      c: 1

  page:
    "InsertMode.focusFirstTextInput":
      t: "Focus the {count} input field"
      k: "gi"
      c: 1

    "Page.next":
      t: "Paginate forward"
      k: "]]"
      o:
        nextpattern: {
          d: "Pattern(s) for next page"
          e: "set nextpattern+=^NextPage|››$ OR set nextpattern=['(下|后)一(页|頁)', '^Next$', '^>$']"
        }

    "Page.prev":
      t: "Paginate backward"
      k: "[["
      o:
        previouspattern: {
          d: "Pattern(s) for prev page"
          e: "set previouspattern+=^PrevPage|‹‹$ OR set previouspattern=['(上|前)一(页|頁)', '^Prev(ious)?']"
        }

    "Page.copySelected":
      t: "Copy selected text"
      k: "Y"

    "Frame.next":
      t: "Next {count} frame"
      k: "]f"
      c: 1

    "Frame.prev":
      t: "Previous {count} frame"
      k: "[f"
      c: 1

    "Url.viewSource":
      t: "View source code in current tab"
      k: "gf"

    "Url.viewSourceNewTab":
      t: "View source code in new tab"
      k: "gF"

  url:
    "Tab.copyUrl":
      t: "Copy current URL to clipboard"
      k: "y"

    "Url.openFromClipboard":
      t: "Open selected text or clipboard content in current tab. If not a valid URL, make a search"
      k: "p"

    "Url.openFromClipboardNewTab":
      t: "Same as `p`, but open selected text or clipboard content in new tab"
      k: "P"

    "Url.increment":
      t: "Increment the last number in URL by {count}"
      k: "<C-a>"
      c: 1

    "Url.decrement":
      t: "Decrement the last number in URL by {count}"
      k: "<C-x>"
      c: 1

    "Url.parent":
      t: "Go to parent {count} URL"
      k: "gu"
      c: 1

    "Url.root":
      t: "Go to the root of the website"
      k: "gU"

    "Url.open":
      t: "Open URLs or search"
      d: "Open URLs from your history, bookmarks, navigation or makes a search. \nUse <C-[0-9]> (red numbers) to open multiple links\nUse arrows to move Up and Down (view options)\nSupports relative paths e.g ../admin"
      k: "o"
      o:
        noautocomplete: "Disable autocomplete"
        searchengines: "JSON of search engines"
        defaultsearch: "Default search engine name"
        autocomplete_prev: "Previous"
        autocomplete_next: "Next"
        autocomplete_next_10: "Next 10"
        autocomplete_prev_10: "Previous 10"
        open_tab_on_the_right: "Always open new tab next to active one"

    "Url.openWithDefault":
      t: "Same as `o`, Open URLs or search (edit current URL)"
      k: "O"

    "Url.tabopen":
      t: "Same as `o`, but open URLs or search in a new tab"
      d: ""
      k: "t"

    "Url.tabopenWithDefault":
      t: "Same as `o`, but open URLs or search in a new tab (edit current URL)"
      k: "T"

    "Url.shortUrl":
      t: "Copy shorten URL to clipboard"
      d: "the URL is shortened by `http://goo.gl`, You can use your account after grand auth in option page"
      k: "<C-y>"

  tabs:
    "Tab.reload":
      t: "Reload current tab"
      k: "r"

    "Tab.reloadWithoutCache":
      t: "Reload  (no cache)"
      k: "<C-r>"

    "Tab.reloadAll":
      t: "Reload all tabs"
      k: "R"

    "Tab.prev":
      t: "Go to left {count} tab"
      k: ["<C-p>", "gT"]
      c: 1

    "Tab.next":
      t: "Go to right {count} tab"
      k: ["<C-n>", "gt"]
      c: 1

    "Tab.moveLeft":
      t: "Move tab {count} left"
      k: "gq"
      c: 1

    "Tab.moveRight":
      t: "Move tab {count} right"
      k: "ge"
      c: 1

    "Buffer.gotoFirstMatch":
      t: "Go to {count} tab or the first matched tab where title / url matches string"
      k: "b"
      c: 1

    "Buffer.deleteMatch":
      t: "Same as `b`, But close matched tabs"
      k: ["dm", "B"]
      c: 1

    "Tab.first":
      t: "Go to first tab"
      k: ["g0", "g^"]

    "Tab.last":
      t: "Go to last tab"
      k: "g$"

    "Tab.selectLastOpen":
      t: "Go to last created tab"
      k: "gl"

    "Tab.selectPrevious":
      t: "Go to last selected or {count} tab"
      k: ["<C-6>", "<C-^>"]
      c: 1

    "Tab.close":
      t: "Close current tab or {count} tabs and select right tab"
      k: "dc"
      c: 1

    "Tab.closeOtherTabs":
      t: "Close all tabs except current tab"
      k: "do"

    "Tab.closeLeftTabs":
      t: "Close all or {count} tabs on the left"
      k: "dl"
      c: 1

    "Tab.closeRightTabs":
      t: "Close all or {count} tabs on the right"
      k: "dr"
      c: 1

    "Tab.closeAndFoucsLeft":
      t: "Close current tab and select left tab"
      k: "D"
      c: 1

    "Tab.closeAndFoucsLast":
      t: "Close current tab and select last selected tab"
      k: "<M-d>"
      c: 1

    "Tab.closeUnPinnedTabs":
      t: "Close unpinned tabs"
      k: "dp"

    "Tab.closePinnedTabs":
      t: "Close pinned tabs"
      k: "dP"

    "Tab.togglePin":
      t: "pin"
      d: "Toggle current tab pin on/off"
      k: "gp"

    "Tab.unpinAllTabsInCurrentWindow":
      t: "Unpin all tabs in current window"
      k: "gP"

    "Tab.unpinAllTabsInAllWindows":
      t: "Unpin all tabs from all windows"
      k: "gwP"

    "Tab.reopen":
      t: "Reopen the last closed {count} tab"
      k: "u"
      c: 1

    "Tab.duplicate":
      t: "Duplicate {count} current tab"
      k: "gd"
      c: 1

    "Tab.detach":
      t: "Detach current tab to a new window"
      k: "gD"

    "Tab.openInIncognito":
      t: "Toggle incognito mode for current tab (need to enable Vrome in incognito mode)"
      k: "gI"

    "Tab.markForMerging":
      t: "Marks tab for merging (can mark multiple tabs)"
      k: "gm"

    "Tab.markAllForMerging":
      t: "Marks all tabs in current window for merging"
      k: "gM"

    "Tab.putMarkedTabs":
      t: "Moves marked tab(s)"
      k: "gv"

  "history + bookmarks":
    "History.back":
      t: "Go {count} pages back"
      k: ["H", "<C-o>"]
      c: 1

    "History.forward":
      t: "Go {count} pages forward"
      k: ["L", "<C-i>"]
      c: 1

    "History.start":
      t: "Filter History with keyword (support Dialog extend mode)"
      k: "gh"

    "History.new_tab_start":
      t: "Same as `gh`, but open in new tab (support Dialog extend mode)"
      k: "gH"

    "Bookmark.start":
      t: "Filter bookmarks with keyword (support Dialog extend mode)"
      k: "gb"

    "Bookmark.new_tab_start":
      t: "Same as `gb`, but open in new tab (support Dialog extend mode)"
      k: "gB"

  hints:
    "Hint.start":
      t: "Start Hint mode"
      d: "TODO"
      k: "f"
      o:
        hintkeys:
          d: "Keys used to generate hints"
          e: "set hintkeys=jlkhfsdagwerui"
        useletters:
          d: "Use letters or numbers to generate hints, if equal 0, then hintkeys will be ignored"
          e: "set useletters=1"

    "Hint.new_tab_start":
      t: "Same as `f`, but open in new tabs"
      k: "F"

    "Hint.multi_mode_start":
      t: "Same as `f`, but could open multiple links"
      k: "<M-f>"

  search:
    "Search.start":
      t: "Start forward search (with selected text)"
      k: ["/", "*"]

    "Search.backward":
      t: "Start backward search (with selected text)"
      k: ["?", "#"]

    "Search.next":
      t: "Search next"
      k: ["n", "<Enter>"]
      c: 1

    "Search.prev":
      t: "Search previous"
      k: ["N", "<C-Enter>"]
      c: 1

    "Search.openCurrent":
      t: "Open selected element in current tab"
      k: "<S-Enter>"
      both: 1

    "Search.openCurrentNewTab":
      t: "Open selected element in a new tab"
      k: "<M-Enter>"
      both: 1

  insert:
    "InsertMode.externalEditor":
      t: "Launch the external editor"
      k: "<C-i>"
      s: 1
      m: ["i"]
      o:
        editor:
          d: "Set editor command,default 'editor' is 'gvim -f'"
          e: "set editor=gvim -f"

    "InsertMode.moveToFirstOrSelectAll":
      t: "Move to first words or select all"
      k: "<C-a>"
      m: ["i"]

    "InsertMode.moveToEnd":
      t: "Move to end"
      k: "<C-e>"
      m: ["i"]

    "InsertMode.deleteToBegin":
      t: "Delete to the beginning of the line"
      k: "<C-u>"
      m: ["i"]

    "InsertMode.deleteToEnd":
      t: "Delete forwards to end of line"
      k: "<C-k>"
      m: ["i"]

    "InsertMode.deleteBackwardWord":
      t: "Delete backward word"
      k: ["<M-y>", "<C-h>", "<M-w>"]
      m: ["i"]

    "InsertMode.deleteForwardWord":
      t: "Delete forward word"
      k: ["<M-o>", "<C-l>", "<M-d>"]
      m: ["i"]

    "InsertMode.deleteBackwardChar":
      t: "Delete backward char"
      k: ["<M-u>", "<C-h>"]
      m: ["i"]

    "InsertMode.deleteForwardChar":
      t: "Delete forward char"
      k: ["<M-i>", "<C-d>"]
      m: ["i"]

    "InsertMode.MoveBackwardWord":
      t: "Move one word backwards"
      k: "<M-h>"
      m: ["i"]

    "InsertMode.MoveForwardWord":
      t: "Move one word forwards"
      k: "<M-l>"
      m: ["i"]

    "InsertMode.MoveBackwardChar":
      t: "Move one char backwards"
      k: "<M-j>"
      m: ["i"]

    "InsertMode.MoveForwardChar":
      t: "Move one char forwards"
      k: "<M-k>"
      m: ["i"]

  marks:
    "Marks.addLocalMark":
      t: "Add local mark"
      d: "Mark position x,y on the page e.g ma"
      k: "m [a-z][0-9]"
      gk: ->
        for num in [65..122] when num not in [91..96]
          KeyEvent.add "m" + String.fromCharCode(num), Marks.addLocalMark

    "Marks.gotoLocalMark":
      t: "Go to local mark"
      d: "Go to marked position on the page e.g 'a"
      k: "' [a-z][0-9]"
      gk: ->
        for num in [65..122] when num not in [91..96]
          KeyEvent.add "'" + String.fromCharCode(num), Marks.gotoLocalMark

    "Marks.addQuickMark":
      t: "Add new quick mark for current URL"
      k: "M"

    "Marks.gotoQuickMark":
      t: "Go to quick mark (support Dialog extend mode)"
      k: "go"

    "Marks.gotoQuickMarkNewTab":
      t: "Same as `go`, but open in new tab (support Dialog extend mode)"
      k: "gn"


# TODO: add command line to help + mapping object
# CmdLine.add "help", "Open the help page", Help.show
CmdLine.add "bdelete", "Close all matched tabs. like `B` in normal mode", Buffer.deleteMatchHandle
CmdLine.add "toggle-images", "Toggle images", Page.hideImages

CmdLine.add "reload_extension", "Reload All Extensions", Command.reload_extension
CmdLine.add "print", "Print the current page you see", Command.print
CmdLine.add "window_open", "Open a new window", Window.create
CmdLine.add "window_only", "Close other windows", Window.only

# CmdLine.add "mdelete", "Delete matched marks", Marks.deleteQuickMark
# CmdLine.add "make-links", "Transforms URLs into clickable links", Page.transformURLs

for url in ['downloads', 'bookmarks', 'history', 'chrome_help', 'settings', 'extensions', 'github', 'issues', 'options']
  CmdLine.add "open_#{url}!", "Open #{url} page in new tab", Links[url]
  CmdLine.add "open_#{url}", "Open #{url} page", Links[url]


root = exports ? window
root.CMDS = CMDS
