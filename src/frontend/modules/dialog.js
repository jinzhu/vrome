var Dialog = (function() {
  var isEnabled, selected, sources, dialog_mode, last_keyword, search, newTab;

	var box_id             = "__vrome_dialog";
	var search_results_id  = "__vrome_searchResults";
	var selected_class     = "__vrome_selected";
	var selected_quick_num = "__vrome_selected_quick_index";
	var notice_id          = "__vrome_dialog_notice";

  function start(title, content, search_callback, newtab) {
    isEnabled    = true;
    last_keyword = null;
    newTab       = newtab;
    search       = search_callback;

    CmdBox.set({title: title, pressDown: handleInput, content: content});
    search(CmdBox.get().content);
  }

	function DialogBox() {
    var box = document.getElementById(box_id);
    var cmdBox = CmdBox.cmdBox();
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('id', box_id);
      box.style.bottom = cmdBox.clientHeight + "px !important";
      document.body.insertBefore(box, document.body.childNodes[0]);
    }
		return box;
	}

	function freshResultBox() {
		var box = DialogBox();
    var results = document.getElementById(search_results_id);
		if (results) { box.removeChild(results); }

		var new_results = document.createElement('div');
		new_results.setAttribute('id', search_results_id);
		box.appendChild(new_results);
		return new_results;
	}

	function draw(msg) {
    if (!isEnabled) { return false; }
    if (msg.urls) { dialog_mode = 'url'; }

		var results_box = freshResultBox();
		selected = 0;

    sources = msg.urls || msg.sources;

    if (sources.length === 0) {
      var result = document.createElement('div');
      result.innerHTML = "No results found!";
      results_box.appendChild(result);
      return;
    }

		for (var i=0; i < sources.length; i++) {
			var source = sources[i];
			var result = document.createElement('div');
      if (dialog_mode == 'url') {
        if (source.url instanceof Array) {
          var values = [];
          for (var j=0; j < source.url.length; j++) {
            var url = source.url[j];
            values.push("<a href='" + url + "'> " + highlight(msg.keyword, url) + "</a>");
          }
          result.innerHTML = values.join(', ');
        } else {
          result.innerHTML = "<a href='" + source.url + "'> " + highlight(msg.keyword, source.title, source.url) + "</a>";
        }
      } else {
        result.innerHTML = highlight(msg.keyword, source);
      }
			results_box.appendChild(result);
		}
    drawSelected();
	}

  function highlight(keyword, text, addition) {
    if (!text) {
      text = addition;
    } else if (addition) {
      text += "\t--\t" + addition;
    }
    return text.slice(0, 75).replace(RegExp(RegExp.escape(keyword),'g'), "<strong>" + keyword + "</strong>");
  }

	function next(dirction) {
		selected += (dirction || 1);
    if (selected > sources.length) { selected = 0; }
    if (selected < 0) {
      selected = selected + sources.length;
      if (selected < 0) selected = 0;
    }
		drawSelected();
	}

	function prev(dirction) {
		next(0 - (dirction || 1));
	}

	function drawSelected() {
		var results = document.body.querySelectorAll('#' + search_results_id + ' div');
		var quick_num_elems = document.body.querySelectorAll('.' + selected_quick_num);
    for (var i=0; i < quick_num_elems.length; i++) {
      quick_num_elems[i].parentNode.removeChild(quick_num_elems[i])
    }

    for (var i = 0; i < results.length; i++) {
			var result = results[i];

      var d_value = i - selected;
      if ((d_value > 0) && (d_value < 10)) {
        var span = document.createElement('span');
        span.setAttribute('class', selected_quick_num);
        span.innerHTML = d_value;
        result.insertBefore(span, result.childNodes[0]);
      }

			if (i !== selected) {
				result.removeAttribute('class');
			} else {
				result.setAttribute('class', selected_class);

        var quick_selects = document.body.querySelectorAll('.' + selected_quick_num);
        if (quick_selects[quick_selects.length-1]) {
          quick_selects[quick_selects.length-1].scrollIntoViewIfNeeded();
        } else {
          result.scrollIntoViewIfNeeded();
        }

        var current_elements = current();
        if (current_elements) {
          // Acts as array. (Actually it is HTMLCollection)
          if (current_elements.length) {
            var values = []
            for(var j=0; j < current_elements.length; j++) {
              values.push(current_elements[j].getAttribute("href"));
            }
            notice(values.join(','));
          } else {
            notice(current_elements.getAttribute("href"));
          }
        }
			}
		}
	}

	function current() {
		var selected_box = document.getElementsByClassName(selected_class)[0];
		if (selected_box) { return selected_box.children }
	}

	function stop() {
    if (!isEnabled) { return false; }

    var box = DialogBox();
    if (box) { document.body.removeChild(box); }
    var box = document.getElementById(notice_id);
    if (box) { document.body.removeChild(box); }
    isEnabled = false;
    CmdBox.remove();
	}

  function notice(msg) {
    var box = document.getElementById(notice_id);
    var cmdBox = CmdBox.cmdBox();
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('id', notice_id);
      box.style.bottom = "0 !important";
      box.style.right  = cmdBox.clientWidth + "px !important";
      // 8 is the padding for cmdbox
      box.style.height = (cmdBox.clientHeight - 4) + "px !important";
      box.style.width  = (DialogBox().clientWidth - cmdBox.clientWidth + 8) + "px !important";
      document.body.insertBefore(box, document.body.childNodes[0]);
    }
    box.innerHTML = msg;
  }

  function handleInput(e) {
    var key = getKey(e);

    if (key.match(/<C-(\d)>|<Up>|<S-Tab>|<Down>|<Tab>|Control/)) {
      if (key.match(/<C-(\d)>/)) {
        next(Number(RegExp.$1));
        openCurrent();
      }

      if (key == Option.get('autocomplete_prev')) prev();
      if (key == Option.get('autocomplete_next')) next();
      if (key == Option.get('autocomplete_prev_10')) prev(10);
      if (key == Option.get('autocomplete_next_10')) next(10);

      KeyEvent.stopPropagation(e);
      return;
    }

    if (!isEscapeKey(key)) { setTimeout(delayToWaitKeyDown, 20); }
  }

  function delayToWaitKeyDown() {
    var keyword = CmdBox.get().content;
    if (last_keyword !== keyword) {
      search(keyword);
      last_keyword = keyword;
    }
  }

  function openCurrent(/*Boolean*/ keep_open) {
    if (!isEnabled) { return false; }
    var elem = current();
    if (!elem) { return false; }

    var options = {};
    options[Platform.mac ? 'meta' : 'ctrl'] = keep_open || newTab;
    clickElement(elem, options);

    if (!keep_open) { stop(); }
  }

  function open(/*Boolean*/ keep_open) {
    setTimeout(openCurrent, 500, keep_open);
  }

	return {
    start : start,
		draw    : draw,
    openCurrent : open,
    openCurrentNewTab : function() { open(true) },
		stop  : stop
	};
})();
