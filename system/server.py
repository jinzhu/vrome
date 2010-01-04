#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Editor Launching Service for Vrome (http://github.com/jinzhu/vrome)
In the style of jinzhu's original ruby script here:
http://github.com/jinzhu/vrome/blob/master/system/server.rb
by 8pm, Jan 4. 2010"""
import os
from tempfile import mkstemp
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

class EditorHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.getheader('content-length'))
        body = self.rfile.read(length).split('&', 1)
        editor = body[0].split('=')[1]
        if editor == 'gvim': editor = 'gvim -f'
        fd, filename = mkstemp()
        os.write(fd, body[1].split('=', 1)[1])
        os.close(fd)
        os.system("%s %s" % (editor, filename))
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(open(filename, 'r').read())
        os.remove(filename)

def run_server():
    httpd = HTTPServer(('', 20000), EditorHandler)
    httpd.serve_forever()

if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print 'Server Terminated.'

# -*- vim: set sts=4 sw=4 et fdm=marker tw=72:  ------  vim modeline -*-
