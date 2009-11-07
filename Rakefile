require 'rake'

desc 'build extension'
task :build do
  `ruby #{File.join(File.dirname(__FILE__),'buildex.rb')} --pack-extension=#{File.dirname(__FILE__)} --pack-extension-key=#{File.join(File.dirname(__FILE__),"vimlike-smooziee.pem")}`
end

desc 'install extension'
task :install => [:build] do
  `chromium-browser  #{File.join(File.dirname(__FILE__),'vimlike-smooziee.crx')}`
end
