root = exports ? window

root.AcceptKey = ["<Enter>", "<C-j>", "<C-m>"]
root.CancelKey = ["<Esc>", "<C-[>"]
root.CtrlEscapeKey = ["<C-Esc>"]

extractFunction = (functionName) ->
  func = (func ? root)[action] for action in functionName.split(".")
  func

imapFunc = (key, func, virtual_key) ->
  KeyEvent.add key, extractFunction(func), true

nmapFunc = (key, func, virtual_key) ->
  KeyEvent.add key, extractFunction(func)

cmapFunc = (key, func, virtual_key) ->
  CmdLine.add key, extractFunction(func)

mapFunc = (key, func, virtual_key) ->
  nmapFunc(key, func, virtual_key)
  imapFunc(key, func, virtual_key)


mapFunc  "<F1>", "Help.show"
nmapFunc ":", "CmdLine.start"

mapFunc AcceptKey, "AcceptKeyFunction"
mapFunc CancelKey, "CancelKeyFunction"

mapFunc "<C-z>", "KeyEvent.disable"
mapFunc "<C-v>", "KeyEvent.passNextKey"
mapFunc CtrlEscapeKey, "CtrlEscapeKeyFunction"

mapFunc "<C-Enter>", "Dialog.openCurrentNewTab"

nmapFunc ".", "KeyEvent.runLast" # count


## ZOOM
nmapFunc "zi", "Zoom.current_in" # count
nmapFunc "zo", "Zoom.current_out" # count
nmapFunc "zm", "Zoom.current_more" # count
nmapFunc "zr", "Zoom.current_reduce" # count
nmapFunc "zz", "Zoom.current_reset"

nmapFunc "zI", "Zoom.Zoomin" # count
nmapFunc "zO", "Zoom.out" # count
nmapFunc "zM", "Zoom.more" # count
nmapFunc "zR", "Zoom.reduce" # count
nmapFunc "zZ", "Zoom.reset" # count


## Scroll
nmapFunc "gg", "Scroll.top"
nmapFunc "G", "Scroll.bottom"
nmapFunc "0", "Scroll.first"
nmapFunc "$", "Scroll.last"
nmapFunc "%", "Scroll.toPercent" #count
nmapFunc "k", "Scroll.up" #count
nmapFunc "j", "Scroll.down" #count
nmapFunc "h", "Scroll.left" #count
nmapFunc "l", "Scroll.right" #count
nmapFunc "<C-f>", "Scroll.nextPage" #count
nmapFunc "<C-b>", "Scroll.prevPage" #count
nmapFunc "<C-d>", "Scroll.nextHalfPage" #count
nmapFunc "<C-u>", "Scroll.prevHalfPage" #count

## Page
nmapFunc "gi", "InsertMode.focusFirstTextInput" #count
nmapFunc "]]", "Page.next"
nmapFunc "[[", "Page.prev"

nmapFunc "Y", "Page.copySelected"
nmapFunc "<C-g>", "Page.showInfo"

## Frame
nmapFunc "]f", "Frame.next"
nmapFunc "[f", "Frame.prev"

## URL
nmapFunc "gf", "Url.viewSource"
nmapFunc "gF", "Url.viewSourceNewTab"

nmapFunc "y", "Tab.copyUrl"
nmapFunc "p", "Url.openFromClipboard"
nmapFunc "P", "Url.openFromClipboard"
nmapFunc "<M-p>", "Url.openFromClipboardAndFocusNewTab"

nmapFunc "<C-a>", "Url.increment" # count
nmapFunc "<C-x>", "Url.decrement" # count

nmapFunc "gu", "Url.parent" # count
nmapFunc "gU", "Url.root"
nmapFunc "gr", "Url.referer"
nmapFunc "gR", "Url.tabReferer"

nmapFunc "o", "Url.open"
nmapFunc "O", "Url.open"
nmapFunc "t", "Url.tabopen"
nmapFunc "T", "Url.tabopen"

nmapFunc "<C-y>", "Url.shortUrl"

## Tab
nmapFunc "r", "Tab.reload"
nmapFunc "<C-r>", "Tab.reloadWithoutCache"
nmapFunc "R", "Tab.reloadAll"

nmapFunc ["<C-p>", "gT"], "Tab.prev" #count
nmapFunc ["<C-n>", "gt"], "Tab.next" #count

nmapFunc "gq", "Tab.moveLeft" #count
nmapFunc "ge", "Tab.moveRight" #count

## Buffer 
nmapFunc "b", "Buffer.gotoFirstMatch" #count
nmapFunc ["dm", "B"], "Buffer.deleteMatch" #count

## Tab
nmapFunc ["g0", "g^"], "Tab.first"
nmapFunc "g$", "Tab.last"
nmapFunc "gl", "Tab.selectLastOpen"
nmapFunc ["<C-6>", "<C-^>"], "Tab.selectPrevious"

nmapFunc "dc", "Tab.close"
nmapFunc "D", "Tab.closeAndFoucsLeft"
nmapFunc "<M-d>", "Tab.closeAndFoucsLast"
nmapFunc "do", "Tab.closeOtherTabs"
nmapFunc "dl", "Tab.closeLeftTabs"
nmapFunc "dr", "Tab.closeRightTabs"

nmapFunc "u", "Tab.reopen"

nmapFunc "gd", "Tab.duplicate"
nmapFunc "gD", "Tab.detach"

nmapFunc "dp", "Tab.closeUnPinnedTabs"
nmapFunc "dP", "Tab.closePinnedTabs"
nmapFunc "gp", "Tab.togglePin"
nmapFunc "gP", "Tab.unpinAllTabsInCurrentWindow"
nmapFunc "gwP", "Tab.unpinAllTabsInAllWindows"

nmapFunc "gI", "Tab.openInIncognito"

nmapFunc "gm", "Tab.markForMerging"
nmapFunc "gM", "Tab.markAllForMerging"
nmapFunc "gv", "Tab.mergeMarkedTabs"

## History & Bookmark
nmapFunc ["H", "<C-o>"], "History.back"
nmapFunc ["L", "<C-i>"], "History.forward"
nmapFunc "gh", "History.start"
nmapFunc "gH", "History.new_tab_start"
nmapFunc "gb", "Bookmark.start"
nmapFunc "gB", "Bookmark.new_tab_start"

## Hint
nmapFunc "f", "Hint.start"
nmapFunc "F", "Hint.new_tab_start"
nmapFunc "<M-f>", "Hint.multi_mode_start"

## Search
nmapFunc ["/", "*"], "Search.start"
nmapFunc ["?", "#"], "Search.backward"
nmapFunc "n", "Search.next"
nmapFunc "N", "Search.prev"
imapFunc "<M-Enter>", "Search.next"
imapFunc "<S-Enter>", "Search.prev"
nmapFunc "<C-Enter>", "Search.openCurrentNewTab"

## Marks
mark_keys = ('m' + String.fromCharCode(num)) for num in [65..122] when num not in [91..96]
nmapFunc mark_keys, "Marks.addLocalMark", "m [a-z][0-9]"

jump_keys = ("'" + String.fromCharCode(num)) for num in [65..122] when num not in [91..96]
nmapFunc jump_keys, "Marks.addLocalMark", "' [a-z][0-9]"

nmapFunc "M", "Marks.addQuickMark"
nmapFunc "go", "Marks.gotoQuickMark"
nmapFunc "gn", "Marks.gotoQuickMarkNewTab"

## Insert Mode
imapFunc "<C-i>", "InsertMode.externalEditor"
imapFunc "<C-a>", "InsertMode.moveToFirstOrSelectAll"
imapFunc "<C-e>", "InsertMode.moveToEnd"
imapFunc "<C-u>", "InsertMode.deleteToBegin"
imapFunc "<C-k>", "InsertMode.deleteToEnd"

imapFunc ["<M-y>"], "InsertMode.deleteBackwardWord"
imapFunc ["<M-o>"], "InsertMode.deleteForwardWord"
imapFunc ["<M-u>"], "InsertMode.deleteBackwardChar"
imapFunc ["<M-i>"], "InsertMode.deleteForwardChar"

imapFunc ["<M-h>"], "InsertMode.MoveBackwardWord"
imapFunc ["<M-l>"], "InsertMode.MoveForwardWord"
imapFunc ["<M-j>"], "InsertMode.MoveBackwardChar"
imapFunc ["<M-k>"], "InsertMode.MoveForwardChar"


## CmdLine
cmapFunc "help", "Help.show"
cmapFunc "bdelete", "Buffer.deleteMatchHandle"
cmapFunc "make_links", "AutoLink.makeLink"
cmapFunc "images_toggle", "Command.imagesToggle"
cmapFunc "images_only", "Command.imagesOnly"
cmapFunc "javascript", "Command.javascript"
cmapFunc "css", "Command.css"
cmapFunc "source", "Command.source"
cmapFunc "reload_extension", "Command.reload_extension"
cmapFunc "print", "Command.print"
cmapFunc "capture", "Window.capture"
cmapFunc "saveas", "Window.saveas"

cmapFunc "quit", "Tab.close"
cmapFunc "window_open", "Window.create"
cmapFunc "window_only", "Window.only"
cmapFunc "window_close", "Window.close"
cmapFunc "window_closeall", "Window.close_all"

# CmdLine.add "mdelete", "Delete matched marks", Marks.deleteQuickMark

for url in ['downloads', 'bookmarks', 'history', 'chrome_help', 'settings', 'extensions', 'github', 'issues', 'options']
  cmapFunc ["open_#{url}!", "open_#{url}"], "Links['#{url}']"
