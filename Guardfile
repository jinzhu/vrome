notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

puts "Open chrome://extensions-frame and paste `reload_extension.js` in developer tools console"
require 'clipboard'
Clipboard.copy File.read("utils/reload_extension.js")

guard 'coffeescript', :input => 'src/'

guard 'shell' do
  watch(/.(css|js|json|html)/) do |m|
    system "utils/update_version.rb"
  end

  watch(/system/) do |m|
    system "utils/restart_server.sh"
  end
end
