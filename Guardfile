notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

guard 'shell', :all_on_start => true do
  watch(/system\/ruby/) do |files|
    system "utils/restart_server.sh"
  end
end

guard 'shell' do
  watch(/.(css|js|json|html)/) do
    system "utils/update_version.rb"
  end

  watch(/.coffee/) do |files|
    files.map do |file|
      next if file =~ /help/
      js_file = file.sub(/coffee$/, "js").sub(/coffee/, 'src')
      js_map_file = js_file + ".map"
      system "mkdir -p #{File.dirname(js_file)}",

      # CoffeeScript
      # "coffee -p -c #{file} > #{js_file}",

      # CoffeeScriptRedux
      js_file_content = `coffee --js -i #{file}`
      `coffee --source-map -i #{file} > #{js_map_file}`
      File.open(js_file, "w+") {|f| f << js_file_content + "//@ sourceMappingURL=#{js_map_file}'" }
      puts "Generated js file #{js_file}"
    end
  end
end
