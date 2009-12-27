require 'socket'
require 'tempfile'
require 'cgi'

server = TCPServer.new('localhost', 20000)

while (session = server.accept)
  # GET /?data='originaltext' HTTP/1.1
  text = CGI.unescape(session.gets.split[1].split('=',2)[1]);
  puts "Request: text : #{text}"

  tmpfile = Tempfile.new('editor')
  tmpfile.write text
  tmpfile.flush
  system("gvim -f #{tmpfile.path}")
  session.puts File.read(tmpfile.path)

  tmpfile.delete
  session.close
end
