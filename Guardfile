notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

guard 'shell', :all_on_start => true do
  watch(/.(css|js|json|html)/) do
    system "utils/update_version.rb"
  end

  watch(/system/) do
    system "utils/restart_server.sh"
  end

  watch(/coffee/) do |files|
    files.map do |file|
      system "coffee -c #{file}"
    end
  end
end
