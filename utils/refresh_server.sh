#!/usr/bin/env bash

pid=`lsof -t -i :20000`
echo $pid
kill -9 $pid

echo "restarting server..."
nohup ./system/ruby/bin/vrome  >> /tmp/vrome_server.out 2>> /tmp/vrome_server.err < /dev/null &
