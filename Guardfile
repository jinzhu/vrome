notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

require 'clipboard'
Clipboard.copy File.read("utils/reload_extension.js")

guard 'coffeescript', :input => 'src/'

guard 'shell' do
  watch(/.(css|js|json|html)/) do |m|
    system "utils/update_version.rb"
  end

  watch(/.rb/) do |m|
    system "utils/restart_server.sh"
  end
end
