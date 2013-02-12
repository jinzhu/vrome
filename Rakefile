require "bundler/setup"
require 'json'

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
    json["content_scripts"][0]["js"]  = Dir['shared/*.js'].concat(Dir['frontend/modules/*.js']).concat(["frontend/cmds.js", "frontend/main.js"])
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
