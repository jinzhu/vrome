require "bundler/setup"
require 'json'

desc "Init Development Environment"
task :init_development_env do
  # Install CoffeeScriptRedux
  `find coffee -type f -iname '*coffee'`.split("\n").map do |file|
    js_file = file.sub(/coffee$/, "js").sub(/coffee/, 'src')
    js_map_file = js_file + ".map"
    system "mkdir -p #{File.dirname(js_file)}"

    js_file_content = `coffee --js -i #{file}`
    `coffee --source-map -i #{file} > #{js_map_file}`
    File.open(js_file, "w+") {|f| f << js_file_content + "//@ sourceMappingURL=#{js_map_file}'" }
    puts "Generated js file #{js_file}"
  end

  # SCSS
  `find coffee -type f -iname '*scss'`.split("\n").map do |file|
    css_file = file.sub(/scss$/, "css").sub(/coffee/, 'src')
    system "mkdir -p #{File.dirname(css_file)}"
    `scss #{file} > #{css_file}`
  end
end

desc "Build Vrome"
task :build do
  system("bundle exec bluecloth README.mkd > ./src/README.html")
  system("bundle exec bluecloth Features.mkd > ./src/files/features.html")
  system("bundle exec bluecloth ChangeLog.mkd > ./src/files/changelog.html")
  system("bundle exec bluecloth Thanks.mkd > ./src/files/thanks.html")

  file = File.join(File.dirname(__FILE__),'src','manifest_pretty.json')

  json = JSON.parse(File.read(file))
  json["version"] = File.read('Version').strip

  Dir.chdir('src') do
    json["content_scripts"][0]["js"]  = Dir['shared/*.js'].sort_by {|x| x.length }.concat(Dir['frontend/modules/*.js']).concat(["frontend/cmds.js", "frontend/main.js"])
    json["content_scripts"][0]["css"] = ['styles/main.css']
    json["background"]["scripts"] = Dir['shared/*.js'].concat(Dir['background/**/*.js']).concat(Dir['oauth/*.js'])
  end

  File.open(File.join(File.dirname(__FILE__),'src','manifest.json'),'w+') do |f|
    f << json.to_json
  end
end

task :zip do
  system("zip -r vrome.zip src/; cp vrome.zip ~")
end

task :default => [:build, :zip]
