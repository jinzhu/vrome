require "bundler/setup"
require 'json'

task :build do
  system("bundle exec bluecloth README.mkd > ./src/README.html")

  file = File.join(File.dirname(__FILE__),'src','manifest_pretty.json')

  json = JSON.parse(File.read(file))
  json["version"] = File.read('Version').strip

  Dir.chdir('src') do
    json["content_scripts"][0]["js"]  = Dir['shared/*.js'].concat(Dir['frontend/modules/*.js']).concat(["frontend/main.js" ])
    json["content_scripts"][0]["css"] = ['styles/main.css']
  end

  File.open(File.join(File.dirname(__FILE__),'src','manifest.json'),'w+') do |f|
    f << json.to_json
  end

  system("zip -r vrome.zip src/; cp vrome.zip ~")
end

task :default => [:build]
