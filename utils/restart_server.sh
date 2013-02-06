#!/usr/bin/env bash

pid=`ps aux | grep vrome | grep -v grep | awk {'print $2'}`
kill -9 $pid > /dev/null 2>&1

echo "restarting server..."
./system/ruby/bin/vrome &
