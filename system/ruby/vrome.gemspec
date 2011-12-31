# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "vrome/version"

Gem::Specification.new do |s|
  s.name        = "vrome"
  s.version     = Vrome::VERSION
  s.authors     = ["Jinzhu"]
  s.email       = ["wosmvp@gmail.com"]
  s.homepage    = "https://github.com/jinzhu/vrome"
  s.summary     = %q{Vrome is a external server for vrome, a Vim keybindings extension for chrome}
  s.description = %q{Vrome is a external server for vrome, a Vim keybindings extension for chrome}

  s.rubyforge_project = "vrome"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  # specify any dependencies here; for example:
  # s.add_development_dependency "rspec"
  s.add_runtime_dependency "json"
end
