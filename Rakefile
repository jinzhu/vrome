require 'bundler/setup'
require 'json'

def build_scss_files
  `find coffee -type f -iname '*scss'`.split("\n").each do |file|
    css_file = file.sub(/scss$/, 'css').sub(/coffee/, 'src')
    system "mkdir -p #{File.dirname(css_file)}"
    `scss #{file} > #{css_file}`
    puts "Generated css file #{css_file}"
  end
end

desc 'Init Development Environment'
task :init_development_env do
  # Install CoffeeScript
  `find coffee -type f -iname '*coffee'`.split("\n").each do |file|
    js_file = file.sub(/coffee$/, "js").sub(/coffee/, 'src')
    `coffee -m -o #{File.dirname(js_file)} -c #{file}`
    puts "Generated js file #{js_file}"
  end

  build_scss_files
end

desc 'Build Vrome'
task :build do
  `find coffee -type f -iname '*coffee'`.split("\n").each do |file|
    js_file = file.sub(/coffee$/, 'js').sub(/coffee/, 'src')
    `coffee -o #{File.dirname(js_file)} -c #{file}`
    puts "Generated js file #{js_file}"
  end

  build_scss_files

  system('bundle exec bluecloth README.mkd    > ./src/README.html')
  system('bundle exec bluecloth Features.mkd  > ./src/background/html/features.html')
  system('bundle exec bluecloth ChangeLog.mkd > ./src/background/html/changelog.html')
  system('bundle exec bluecloth Thanks.mkd    > ./src/background/html/thanks.html')

  file = File.join(File.dirname(__FILE__), 'src', 'manifest_pretty.json')

  json = JSON.parse(File.read(file))
  json['version'] = File.read('Version').strip

  Dir.chdir('src') do
    json['content_scripts'][0]['js'] =
      ['shared/vendor/jquery.js', 'shared/vendor/jquery.highlight.js']
        .concat(Dir['shared/*.js'])
        .concat(Dir['frontend/modules/*.js'])
        .concat(Dir['frontend/*.js'])

    json['content_scripts'][0]['css'] = ['styles/main.css']

    json['background']['scripts'] =
      ['shared/vendor/jquery.js', 'shared/vendor/FileSaver.js']
        .concat(Dir['shared/*.js'])
        .concat(Dir['background/*.js'])
        .concat(Dir['background/modules/*.js'])
        .concat(Dir['oauth/*.js'])
  end

  File.open(File.join(File.dirname(__FILE__), 'src', 'manifest.json'), 'w+') do |f|
    f << json.to_json
  end
end

task :zip do
  system('find -iname "*map" | xargs rm')
  system('rm vrome.zip; zip -r vrome.zip src/; cp vrome.zip ~')
end

task :default => [:build, :zip]
