
# commands are categorized (e.g global, tabs, page etc.)
# legend for attributes
###
t = title
d = description
k = keys (array or string)
s = server required (boolean 1/0)
o = associated options (JSON (option name => option description)
c = count/times is supported (boolean 1/0)
i = works in insert mode (boolean 1/0)
both = exists in both insert mode and normal mode (boolean 1/0)
gk = generated keys -- we use a function to determine the keys associated to that function
###

root = exports ? window

root.AcceptKey = ["<Enter>", "<C-j>", "<C-m>"]
root.CancelKey = ["<Esc>", "<C-[>"]
root.CtrlEscapeKey = ["<C-Esc>"]

CMDS =
  global:
    "Help.show":
      t: "Help (Press again for more)"
      d: "Press key again to expand details and again for options"
      k: "<F1>"
      both: 1
      c: 1

    "CmdLine.start":
      t: "Start command line"
      k: ":"

    "AcceptKeyFunction":
      t: "Submit input"
      k: AcceptKey
      both: 1

    "CancelKeyFunction":
      t: "Cancel action"
      k: CancelKey
      both: 1

    "CtrlEscapeKeyFunction":
      t: "Enable Vrome when in pass-through"
      k: CtrlEscapeKey
      both: 1

    "Dialog.openCurrentNewTab":
      t: "Open selected URL in new tab"
      d: "When in a dialog, Open selected URL (highlighted background) in a new tab"
      k: "<C-Enter>"
      both: 1

    "KeyEvent.disable":
      t: "disable vrome"
      d: "ignore all keys passed to vrome - use <C-ESC> to enable"
      k: "<C-z>"
      o:
        disablesites: "list of disabled sites"
        enable_vrome_key: "key to enable vrome again"

    "KeyEvent.passNextKey":
      t: "pass next key"
      k: "<C-v>"

    "KeyEvent.runLast":
      t: "run last key"
      k: "."
      c: 1

  zoom:
    "Zoom.current_in":
      t: "in"
      k: "zi"
      c: 1

    "Zoom.current_out":
      t: "out"
      k: "zo"
      c: 1

    "Zoom.current_more":
      t: "3x in"
      k: "zm"
      c: 1

    "Zoom.current_reduce":
      t: "3x out"
      k: "zr"
      c: 1

    "Zoom.current_reset":
      t: "reset"
      k: "zz"

    "Zoom.zoomIn":
      t: "in"
      k: "zI"
      c: 1

    "Zoom.out":
      t: "out"
      k: "zO"
      c: 1

    "Zoom.more":
      t: "3x in"
      k: "zM"
      c: 1

    "Zoom.reduce":
      t: "3x in"
      k: "zR"
      c: 1

    "Zoom.reset":
      t: "reset"
      k: "zZ"

  scroll:
    "Scroll.top":
      t: "Go to top"
      d: "Scroll to the top of the page"
      k: "gg"

    "Scroll.bottom":
      t: "Go to bottom"
      d: "Scroll to the bottom of the page"
      k: "G"

    "Scroll.first":
      t: "Go to beginning"
      d: "Scroll to the beginning of the page"
      k: "0"

    "Scroll.last":
      t: "Go to end"
      d: "Scroll to the end of the page"
      k: "$"

    "Scroll.toPercent":
      t: "Go to %"
      d: "Scroll to {count}% of the page"
      k: "%"
      c: 1

    "Scroll.up":
      t: "up"
      k: "k"
      c: 1

    "Scroll.down":
      t: "down"
      k: "j"
      c: 1

    "Scroll.left":
      t: "left"
      k: "h"
      c: 1

    "Scroll.right":
      t: "right"
      k: "l"
      c: 1

    "Scroll.nextPage":
      t: "page forward"
      k: "<C-f>"
      c: 1

    "Scroll.prevPage":
      t: "page backward"
      k: "<C-b>"
      c: 1

    "Scroll.nextHalfPage":
      t: "half page forward"
      k: "<C-d>"
      c: 1

    "Scroll.prevHalfPage":
      t: "half page backward"
      k: "<C-u>"
      c: 1

  page:
    "InsertMode.focusFirstTextInput":
      t: "focus first"
      d: "focus on first text input"
      k: "gi"
      c: 1

    "Page.next":
      t: "Paginate forward"
      k: "]]"
      o:
        nextpattern: "Pattern(s) to match URLs"

    "Page.prev":
      t: "Paginate backward"
      k: "[["
      o:
        previouspattern: "Pattern(s) to match URLs"

    "Page.copySelected":
      t: "Copy selected text"
      k: "Y"

    "Frame.next":
      t: "Next frame"
      k: "]f"
      c: 1

    "Frame.prev":
      t: "Previous frame"
      k: "[f"
      c: 1

    "Url.viewSource":
      t: "View source"
      k: "gf"

    "Url.viewSourceNewTab":
      t: "View source in new tab"
      k: "gF"

  url:
    "Tab.copyUrl":
      t: "copy"
      k: "y"

    "Url.openFromClipboard":
      t: "Open clipboard content"
      d: "Go to URL or make a search"
      k: "p"

    "Url.openFromClipboardNewTab":
      t: "Open clipboard content in new tab"
      d: "Same as `p`"
      k: "P"

    "Url.increment":
      t: "Increment parameter"
      k: "<C-a>"
      c: 1

    "Url.decrement":
      t: "decrement parameter"
      k: "<C-x>"
      c: 1

    "Url.parent":
      t: "Go to parent"
      k: "gu"
      c: 1

    "Url.root":
      t: "go to root"
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
      t: "Open URLs or search (edit current URL)"
      d: "Same as `o`"
      k: "O"

    "Url.tabopen":
      t: "Open URLs or search in a new tab"
      d: "Same as `o`"
      k: "t"

    "Url.tabopenWithDefault":
      t: "Open URLs or search in a new tab (edit current URL)"
      d: "Same as `o`"
      k: "T"

    "Url.shortUrl":
      t: "Shorten URL"
      d: "Shorten URL and copy in clipboard"
      k: "<C-y>"

  tabs:
    "Tab.reload":
      t: "reload"
      k: "r"

    "Tab.reloadWithoutCache":
      t: "reload  (no cache)"
      k: "<C-r>"

    "Tab.reloadAll":
      t: "reload all "
      k: "R"

    "Tab.prev":
      t: "previous"
      k: ["<C-p>", "gT"]
      c: 1

    "Tab.next":
      t: "next"
      k: ["<C-n>", "gt"]
      c: 1

    "Tab.moveLeft":
      t: "move left"
      k: "gq"
      c: 1

    "Tab.moveRight":
      t: "move right"
      k: "ge"
      c: 1

    "Buffer.gotoFirstMatch":
      t: "select first match"
      d: "select first tab matching input"
      k: "b"

    "Tab.first":
      t: "select first"
      k: ["g0", "g^"]

    "Tab.last":
      t: "select last"
      k: "g$"

    "Tab.selectLastOpen":
      t: "select last opened"
      d: "toggle between last selected tab"
      k: "gl"

    "Tab.selectPrevious":
      t: "select last active "
      d: "toggle between last selected tabs"
      k: ["<C-6>", "<C-^>"]
      c: 1

    "Tab.close":
      t: "close"
      d: "close current tab + [count] on the right"
      k: "dc"
      c: 1

    "Tab.closeOtherTabs":
      t: "close all others"
      d: "close all tabs except selected tab"
      k: "do"

    "Tab.closeLeftTabs":
      t: "close all on the left"
      d: "close all tabs on the left of selected tab"
      k: "dl"

    "Tab.closeRightTabs":
      t: "close all on the right"
      d: "close all tabs on the right of selected tab"
      k: "dr"

    "Tab.closeAndFoucsLeft":
      t: "close and select left "
      k: "D"
      c: 1

    "Tab.closeAndFoucsLast":
      t: "close and select last"
      k: "<M-d>"
      c: 1

    "Tab.closeOtherWindows":
      t: "close other windows"
      k: "dW"

    "Tab.closeUnPinnedTabs":
      t: "close unpinned "
      k: "dp"

    "Tab.closePinnedTabs":
      t: "close pinned "
      k: "dP"

    "Buffer.deleteMatch":
      t: "close any matching string"
      d: "close tabs where title / url matches string"
      k: ["dm", "B"]

    "Tab.togglePin":
      t: "pin"
      d: "toggle pin on/off"
      k: "gp"

    "Tab.unpinAllTabsInCurrentWindow":
      t: "unpin all"
      k: "gP"

    "Tab.unpinAllTabsInAllWindows":
      t: "unpin from all windows"
      d: "unpin all tabs from all windows "
      k: "WP"

    "Tab.reopen":
      t: "reopen closed"
      d: "reopen closed tabs - use Ctrl+Shift+T"
      k: "u"

    "Tab.duplicate":
      t: "duplicate"
      k: "gd"
      c: 1

    "Tab.detach":
      t: "detach"
      d: "detach into a new window"
      k: "gD"

    "Tab.openInIncognito":
      t: "reopen in incognito"
      d: "reopen tab in incognito mode - tab is reloaded"
      k: "gI"

    "Tab.markForMerging":
      t: "merge mark"
      d: "mark tab to be merged"
      k: "gm"

    "Tab.markAllForMerging":
      t: "merge mark all"
      d: "mark all tabs for merging"
      k: "gM"

    "Tab.putMarkedTabs":
      t: "merge put"
      d: "move marked tabs"
      k: "gv"

  "history + bookmarks":
    "History.back":
      t: "back"
      k: ["H", "<C-o>"]
      c: 1

    "History.forward":
      t: "forward"
      k: ["L", "<C-i>"]
      c: 1

    "History.start":
      t: "search + open"
      k: "gh"

    "History.new_tab_start":
      t: "search + open (new tab)"
      k: "gH"

  hints:
    "Hint.start":
      t: "start"
      d: "display hints on any clickable element on the page\n\nSub-actions are available e.g !f where ! is a sub-action and f a hint :\n; focus \n? show info \n[ copy URL \n{ copy text\n\\ open in incognito\n/ search\n"
      k: "f"
      o:
        hintkeys: "keys used to generate hints\nuse `,` to optimize combinations e.g dsafrewq,tgcx\ndsafrewq will be used to create combinations and tgcx will be associated 1 key - 1 link (top elements)"
        useletters: "toggle letters vs numbers"
        hints_highlight: "toggle highlighting"
        hint_actions: "JSON mapping of existing actions"

    "Hint.new_tab_start":
      t: "start in new tab"
      k: "F"

    "Hint.multi_mode_start":
      t: "restart hint mode after typing hint"
      d: "use the first letter in upper case to select open more than one element\nExample: if we have hints such as `FA` `FS` `FD`\ntype `F` then `s` `d`"
      k: "<M-f>"

  search:
    "Search.start":
      t: "start"
      k: ["/", "*"]

    "Search.backward":
      t: "start backward"
      k: ["?", "#"]

    "Search.next":
      t: "next"
      k: ["n", "<Enter>"]
      c: 1

    "Search.prev":
      t: "previous"
      k: ["N", "<C-Enter>"]
      c: 1

    "Search.openCurrent":
      t: "open"
      d: "open match"
      k: "<S-Enter>"
      both: 1

    "Search.openCurrentNewTab":
      t: "open (new tab)"
      k: "<M-Enter>"
      both: 1

  insert:
    "InsertMode.externalEditor":
      t: "open active input in external editor"
      d: "sends copy of input to server and open content on gvim then pastes it"
      k: "<C-i>"
      s: 1
      i: 1
      o:
        editor: "editor command"

    "InsertMode.moveToFirstOrSelectAll":
      t: "move to beginning or select all"
      k: "<C-a>"
      i: 1

    "InsertMode.moveToEnd":
      t: "move to end"
      k: "<C-e>"
      i: 1

    "InsertMode.deleteToBegin":
      t: "delete to beginning"
      k: "<C-u>"
      i: 1

    "InsertMode.deleteToEnd":
      t: "delete to end"
      k: "<C-k>"
      i: 1

    "InsertMode.deleteBackwardWord":
      t: "delete backward word"
      k: ["<M-y>", "<C-h>", "<M-w>"]
      i: 1

    "InsertMode.deleteForwardWord":
      t: "delete forward word"
      k: ["<M-o>", "<C-l>", "<M-d>"]
      i: 1

    "InsertMode.deleteBackwardChar":
      t: "backspace"
      k: ["<M-u>", "<C-h>"]
      i: 1

    "InsertMode.deleteForwardChar":
      t: "delete forward character"
      k: ["<M-i>", "<C-d>"]
      i: 1

    "InsertMode.MoveBackwardWord":
      t: "move one word backwards"
      k: "<M-h>"
      i: 1

    "InsertMode.MoveForwardWord":
      t: "move one word forwards"
      k: "<M-l>"
      i: 1

    "InsertMode.MoveBackwardChar":
      t: "move one char backwards"
      k: "<M-j>"
      i: 1

    "InsertMode.MoveForwardChar":
      t: "move one char forwards"
      k: "<M-k>"
      i: 1

  marks:
    "Marks.addLocalMark":
      t: "local mark"
      d: "mark position x,y on the page e.g ma"
      k: "m [a-z][0-9]"
      gk: ->
        for num in [65..122] when num not in [91..96]
          KeyEvent.add "m" + String.fromCharCode(num), Marks.addLocalMark

    "Marks.gotoLocalMark":
      t: "go to local mark"
      d: "go to marked position on the page e.g 'a"
      k: "' [a-z][0-9]"
      gk: ->
        for num in [65..122] when num not in [91..96]
          KeyEvent.add "'" + String.fromCharCode(num), Marks.gotoLocalMark

    "Marks.addQuickMark":
      t: "add quick mark"
      d: "associate mark to URL"
      k: "M"

    "Marks.gotoQuickMark":
      t: "go to quick mark"
      d: "open dialog + type mark and URL is opened"
      k: "go"

    "Marks.gotoQuickMarkNewTab":
      t: "go to quick mark (new tab)"
      k: "gn"

    "Bookmark.start":
      t: "search bookmarks + open"
      k: "gb"

    "Bookmark.new_tab_start":
      t: "search bookmarks + open (new tab)"
      k: "gB"

root = exports ? window
root.CMDS = CMDS
