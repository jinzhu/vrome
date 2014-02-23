function highlight(node, re, nodeName, className, filterFunction) {
    if (node.nodeType === 3) {
        var match = node.data.match(re);
        if (match) {
            var highlightElement = document.createElement(nodeName);
            highlightElement.className = className;
            var wordNode = node.splitText(match.index);
            wordNode.splitText(match[0].length);
            var wordClone = wordNode.cloneNode(true);
            highlightElement.appendChild(wordClone);
            wordNode.parentNode.replaceChild(highlightElement, wordNode);
            return 1; //skip added node in parent
        }
    } else if (node.nodeType === 1 && node.childNodes && // only element nodes that have children
            node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'TEXTAREA' && // ignore script, style, textarea nodes
            node.id !== '_vrome_cmd_box' && // ignore _vrome_cmd_box
            !(node.tagName === nodeName && node.className === className) && // skip if already highlighted
            filterFunction(node)) {
        for (var i = 0; i < node.childNodes.length; i++) {
            i += highlight(node.childNodes[i], re, nodeName, className, filterFunction);
        }
    }
    return 0;
}

jQuery.fn.unhighlight = function(options) {
    var settings = { className: 'highlight', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + '.' + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.highlight = function(word, options) {
    var settings = {
        className:      'highlight',
        element:        'span',
        filterFunction: function(node) { return true; }
    };
    jQuery.extend(settings, options);

    var re = new RegExp(word, 'i');

    highlight(this.get(0), re, settings.element.toUpperCase(),
        settings.className, settings.filterFunction);
};
