#!/usr/bin/env ruby

filename = File.dirname(File.expand_path(__FILE__)) + "/version.txt"

version = 0
if File.exists? filename
  version = eval(File.read(filename))
end
version += 1

tmpfile = File.new filename, "w"
tmpfile.write version
tmpfile.flush

puts version