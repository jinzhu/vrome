var Dialog = (function() {
  var isEnabled, selected, sources, diaLogMode;

	var box_id = "__vrome_dialog";
	var search_results_id = "__vrome_searchResults";
	var selected_class = "__vrome_selected";
	var notice_id = "__vrome_dialog_notice";

  function start() {
    isEnabled = true;
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
    if (msg.urls) { diaLogMode = 'url'; }

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
      if (diaLogMode == 'url') {
        result.innerHTML = "<a href='" + source.url + "'> " + highlight(msg.keyword, source.title, source.url) + "</a>";
      } else {
        result.innerHTML = highlight(msg.keyword, source);
      }
			results_box.appendChild(result);
		}
		next();
	}

  function highlight(keyword, text, addition) {
    if (addition) { text += "\t--\t" + addition; }
    return text.slice(0, 75).replace(RegExp(keyword,'g'), "<strong>" + keyword + "</strong>");
  }

	function next() {
		selected += 1;
		if (selected > sources.length) { selected = 1; }
		drawSelected();
	}

	function prev() {
		selected -= 1;
		if (selected <= 0) { selected = sources.length }
		drawSelected();
	}

	function drawSelected() {
		if (selected === 0) { return; }

		var results = document.body.querySelectorAll('#' + search_results_id + ' div');

    for (var i = 0; i < results.length; i++) {
			var result = results[i];
			if ((i + 1) !== selected) {
				result.removeAttribute('class');
			} else {
				result.setAttribute('class', selected_class);
        result.scrollIntoViewIfNeeded();
        notice(current().getAttribute("href"));
			}
		}
	}

	function current() {
		var selected_box = document.getElementsByClassName(selected_class)[0];
		if (selected_box) { return selected_box.children[0] }
	}

	function stop() {
    var box = DialogBox();
    if (box) { document.body.removeChild(box); }
    var box = document.getElementById(notice_id);
    if (box) { document.body.removeChild(box); }
    isEnabled = false;
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

	return {
		draw    : draw,
		next    : next,
		prev    : prev,
		current : current,
    start : start,
		stop  : stop
	};
})();
