#!/bin/bash

echo Preprocessing...

cd /opt/zola/preprocessing/blogroll
docker exec freshrss ./cli/export-opml-for-user.php --user justin > ./feeds.opml.xml
python3 opml-parser.py ./feeds.opml.xml /opt/zola/wasabipesto.com/static/data/blogroll.md

echo Publishing...

cd /opt/zola/wasabipesto.com
zola build
rm -r /opt/nginx/www/wasabipesto.com/*
mv public/* /opt/nginx/www/wasabipesto.com