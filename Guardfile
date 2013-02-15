notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

guard 'shell', :all_on_start => true do
  watch(/.(css|js|json|html)/) do
    system "utils/update_version.rb"
  end

  watch(/system/) do
    system "utils/restart_server.sh"
  end

  watch(/.coffee/) do |files|
    files.map do |file|
      js_file = file.sub(/coffee$/, "js").sub(/coffee/, 'src')
      js_map_file = js_file + ".map"
      system "mkdir -p #{File.dirname(js_file)}",

      next if file =~ /help/

      [
        # CoffeeScript
        # "coffee -p -c #{file} > #{js_file}",
        # CoffeeScriptRedux
        "coffee --js -i #{file} > #{js_file}",
        "coffee --source-map -i #{file} > #{js_map_file}",
        "(echo; echo '//@ sourceMappingURL=#{js_map_file}') >> #{js_file}"
      ].map do |shell|
        puts shell
        system shell
      end
    end
  end
end
