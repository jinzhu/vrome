#!/usr/bin/env bash

# script to restart server whenever changes are made
# watch_and_do /home/hassen/workspace/vrome/system/ruby/lib rb /home/hassen/workspace/vrome/refresh_server.sh
pid=`lsof -t -i :20000`
echo $pid
kill -9 $pid

echo "restarting server..."
nohup ./system/ruby/bin/vrome  >> /tmp/vrome_server.out 2>> /tmp/vrome_server.err < /dev/null &
