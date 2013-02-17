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
