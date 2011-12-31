= Vrome

  Vrome is a external server for Vrome: a Vim keybindings extension for chrome.(https://chrome.google.com/webstore/detail/godjoomfiimiddapohpmfklhgmbfffjj/details)

  The server is writen with ruby. so ruby is required. (Install Ruby: http://www.ruby-lang.org/en/downloads/)

=== Install vrome as RubyGem
  $ (sudo) gem install vrome

=== Install vrome from Script
  $ wget https://raw.github.com/jinzhu/vrome/master/system/ruby/bin/vrome
  $ chmod +x vrome
  $ sudo mv vrome /usr/bin/vrome

=== Run It
  $ vrome

=== Running on a different port?

  By default, the service running on port 20000, If you want to run it on a different port.
  You need to update your Vrome(chrome extension)'s option first. (How TO: https://github.com/jinzhu/vrome/wiki/customize-your-vrome)

  For example: If you want to run on port 30000. then you could add `set server_port=30000` to your config.

  Then you can run the service on port 30000 with following command:
  $ vrome 30000

=== Auto start
  // Linux
    Add  `nohup vrome > /dev/null &` to your ~/.xprofile or other xinit files.
  // Mac

  // Windows


== LICENSE:
  Same As Vrome <Chrome Extension>


Copyright (c) 2010~Now Jinzhu (wosmvp@gmail.com)
