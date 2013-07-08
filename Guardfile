notification :tmux, :display_message => true, :timeout => 5, :default_message_format => '%s >> %s'

guard 'shell', :all_on_start => true do
  watch(/system\/ruby/) do |files|
    system "utils/restart_server.sh"
  end
end

guard 'shell' do
  watch(/.(css|js|json|html)$/) do
    system "utils/update_version.rb"
  end

  watch(/.coffee$/) do |files|
    files.map do |file|
      js_file = file.sub(/coffee$/, "js").sub(/coffee/, 'src')

      # CoffeeScript
      # "coffee -p -c #{file} > #{js_file}",
      `coffee -m -o #{File.dirname(js_file)} -c #{file}`

      # CoffeeScriptRedux
      #`coffee --js --source-map-file #{js_map_file} -i #{file} -o #{js_file}`
      puts "Generated js file #{js_file}"
    end
  end

  watch(/.scss$/) do |files|
    files.map do |file|
      css_file = file.sub(/scss$/, "css").sub(/coffee/, 'src')
      puts "scss #{file} > #{css_file}"
      `scss #{file} > #{css_file}`
    end
  end
end
