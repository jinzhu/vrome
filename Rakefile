require 'rake'
require 'rubygems'
require 'builder'
require 'crxmake'
require 'json'

desc 'preinstall'
task :preinstall do
  file = File.join(File.dirname(__FILE__),'preinstall.sh')
  `sh #{file}` if File.exist?(file)
end

desc 'build extension'
task :build => [:build_xml] do
  CrxMake.make(
    :ex_dir     => "src",
    :pkey       => "vrome.pem",
    :crx_output => "vrome.crx",
    :ignoredir  => /\.git/
  )
end

desc "build manifest"
task :build_manifest do
  file = File.join(File.dirname(__FILE__),'src','manifest.json')

  json = JSON.parse(File.read(file))
  json["version"] = File.read('Version').strip
  json["content_scripts"][0]["js"]  = Dir['src/shared/*.js'].concat(Dir['src/modules/*.js']).concat(["src/main.js" ])
  json["content_scripts"][0]["css"] = Dir['src/styles/*.css']

  File.open(file,'w+') do |f|
    f << json.to_json
  end
end

desc "build xml"
task :build_xml => [:build_manifest] do
  file = File.join(File.dirname(__FILE__),'src','manifest.json')
  version = JSON.parse(File.read(file))['version']
  xml = Builder::XmlMarkup.new( :target => File.open('vrome-updates.xml','w+') , :indent => 2 )
  xml.instruct!
  xml.gupdate(:xmlns => 'http://www.google.com/update2/response',:protocol => '2.0') do |x|
    x.app(:appid => 'iiffmolbankaonfoniihhpbpclcenokk') do |y|
      y.updatecheck(:codebase => 'http://github.com/jinzhu/vrome/raw/master/vrome.crx',:version => version)
    end
  end
end

desc 'install extension'
task :install => [:preinstall,:build] do
  `chromium-browser  #{File.join(File.dirname(__FILE__),'vrome.crx')}`
end

task :default => [:install]
