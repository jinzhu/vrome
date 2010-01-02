require 'webrick'
require 'tempfile'

class EditorServer < WEBrick::HTTPServlet::AbstractServlet

  def do_POST(request, response)
    status, content_type, body = do_stuff_with(request)

    response.status          = status
    response['Content-Type'] = content_type
    response.body            = body
  end

  def do_stuff_with(request)
    body = request.body.split('&',2)
    editor = body[0].split('=')[1]
    tmpfile = Tempfile.new('editor')
    tmpfile.write body[1].split('=',2)[1]
    tmpfile.flush
    editor = 'gvim -f' if editor == 'gvim' # Foreground: Don't fork when starting GUI
    system("#{editor} #{tmpfile.path}")
    text = File.read(tmpfile.path)
    tmpfile.delete

    return 200, "text/plain", text
  end
end

server = WEBrick::HTTPServer.new(:Port => 20000)
server.mount "/", EditorServer
trap(:INT) { server.shutdown }
server.start
