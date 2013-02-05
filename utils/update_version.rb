#!/usr/bin/env ruby

filename = File.dirname(File.expand_path(__FILE__)) + "/version.txt"

version = File.exist?(filename) ? File.read(filename).to_i : 0
version += 1

tmpfile = File.new filename, "w"
tmpfile.write version
tmpfile.flush

puts "Version: #{version}"
