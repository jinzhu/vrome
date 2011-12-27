= Vrome

  Vrome is a external server for vrome, a Vim keybindings extension for chrome.(https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details)

  It is writen with ruby. so ruby is required. (ruby-lang.org)

== Install It As Gem
  $ sudo gem install vrome
  $ sudo vrome

== Run It As Script
  $ sudo path/to/vrome/system/ruby/bin/vrome

== Auto start after login
  // Linux
    Add
      "nohup sudo vrome > /dev/null &"
    OR
      "nohup sudo path/to/vrome/system/ruby/bin/vrome > /dev/null &"
    To ~/.xprofile or other xinit file.


== LICENSE:

(The MIT License)

Copyright (c) 2010 ~ Jinzhu

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
