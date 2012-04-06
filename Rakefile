require "bundler/setup"
require 'json'

desc "Init the development environment"
task :init do
  `git submodule init`
  `git submodule update`
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
    json["content_scripts"][0]["js"]  = Dir['shared/*.js'].concat(Dir['frontend/modules/*.js']).concat(["frontend/main.js" ])
    json["content_scripts"][0]["css"] = ['styles/main.css']
  end

  # json["app"] = {"launch" => { "web_url" => "https://github.com/jinzhu/vrome#readme" }}
  # json["homepage_url"] = "https://github.com/jinzhu/vrome"

  File.open(File.join(File.dirname(__FILE__),'src','manifest.json'),'w+') do |f|
    f << json.to_json
  end

  system("zip -r vrome.zip src/; cp vrome.zip ~")
end

desc "Format javascript files, use `rake format_js _the_file_need_to_format` to format some file or `rake format_js` to format all javascript files"
task :format_js do
  if ARGV.length > 1
    javascript_files = ARGV[1..-1]
  else
    javascript_files = `find -iwholename '*background*js' -o -iwholename '*frontend*js' -o -iwholename '*shared*js'`.split("\n")
  end

  javascript_files.map do |file|
    formated_content = `js-beautify/python/js-beautify -s 2 #{file}`
    # add your own formatter here. Do not forget to switch back to approved formatter.
#    formated_content = `js-beautify/python/js-beautify --brace-style=expand -s 4 #{file}`
    File.open(file, 'w') {|f| f.write(formated_content) }
  end
end

task :default => [:build]
