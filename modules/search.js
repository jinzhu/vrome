var Search = (function(){
    var className    = "__vimlike_highlight_box";
    var startTag     = "<span class='__vimlike_highlight_box'>";
    var endTag       = "</span>";
    var originalBody;

    function find(keyword) {
      if(!keyword) return;
      var newBody  = "";
      var bodyText = document.body.innerHTML;
      if(!originalBody) originalBody = bodyText;
      var k = keyword.toLowerCase();  // Lower Case Keyword
      var b = bodyText.toLowerCase(); // Lower Case Body Text

      var i = -1;
      var j = -1;

      while (bodyText.length > i) {
        j = i;
        i = b.indexOf(k, i);

        if (i < 0) {
          newBody += bodyText.substr(j);
          break;
        } else {
          var c_tag_index    = bodyText.lastIndexOf(">", i);
          var o_tag_index    = bodyText.lastIndexOf("<", i);
          var c_script_index = bodyText.lastIndexOf("/script>", i);
          var o_script_index = bodyText.lastIndexOf("<script", i);
          var c_style_index  = bodyText.lastIndexOf("/style>", i);
          var o_style_index  = bodyText.lastIndexOf("<style", i);

          // skip anything inside an html/script/style tag
          if (c_tag_index >= o_tag_index && c_script_index >= o_script_index && c_script_index >= o_style_index) {
            newBody += bodyText.substring(j, i) + startTag + bodyText.substr(i, keyword.length) + endTag;
          }else{
            newBody += bodyText.substring(j, i + keyword.length);
          }

          i = i + keyword.length;
        }
      }
  
      document.body.innerHTML = newBody;
    }

    function handleInput(e){
      remove();
      find(CmdLine.get().content);
    }

    function remove() {
      if(originalBody){
        document.body.innerHTML = originalBody;
        originalBody = '';
      }
    }
 
    function start(){
      CmdLine.set({title : 'SearchMode',pressUp : handleInput,content : ''});
      document.getElementById('__vimlike_cmd_input_box').focus();
    }

    return {
      start  : start,
      remove : remove,
    }
})()
