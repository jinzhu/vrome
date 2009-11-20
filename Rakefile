require 'rake'

desc 'preinstall'
task :preinstall do
  file = File.join(File.dirname(__FILE__),'preinstall.sh')
  `sh #{file}` if File.exist?(file)
end

desc 'build extension'
task :build => [:preinstall] do
  `ruby #{File.join(File.dirname(__FILE__),'buildex.rb')} --pack-extension=#{File.dirname(__FILE__)} --pack-extension-key=#{File.join(File.dirname(__FILE__),"vimlike-smooziee.pem")}`
end

desc 'install extension'
task :install => [:build] do
  `chromium-browser  #{File.join(File.dirname(__FILE__),'vimlike-smooziee.crx')}`
end
