#!/usr/bin/env bash

pid=`lsof -t -i :20000`
kill -9 $pid > /dev/null 2>&1

echo "restarting server..."
./system/ruby/bin/vrome &
