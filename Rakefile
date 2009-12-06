require 'rake'
require 'rubygems'
require 'builder'
require 'json'

desc 'preinstall'
task :preinstall do
  file = File.join(File.dirname(__FILE__),'preinstall.sh')
  `sh #{file}` if File.exist?(file)
end

desc 'build extension'
task :build => [:build_xml] do
  `ruby #{File.join(File.dirname(__FILE__),'buildex.rb')} --pack-extension=#{File.dirname(__FILE__)} --pack-extension-key=#{File.join(File.dirname(__FILE__),"vimlike-smooziee.pem")}`
end

desc "build xml"
task :build_xml do
  version = JSON.parse(File.read('manifest.json'))['version']
    xml = Builder::XmlMarkup.new( :target => File.open('vimlike-smooziee-updates.xml','w+') , :indent => 2 )
     xml.instruct!
     xml.gupdate(:xmlns => 'http://www.google.com/update2/response',:protocol => '2.0') do |x|
      x.app(:appid => 'iiffmolbankaonfoniihhpbpclcenokk') do |y|
        y.updatecheck(:codebase => 'http://github.com/jinzhu/vimlike-smooziee/blob/master/vimlike-smooziee.crx',:version => version)
      end
    end
end

desc 'install extension'
task :install => [:preinstall,:build] do
  `chromium-browser  #{File.join(File.dirname(__FILE__),'vimlike-smooziee.crx')}`
end
