#!/bin/bash

echo Preprocessing...

cd /opt/zola/preprocessing/blogroll
docker exec freshrss ./cli/export-opml-for-user.php --user justin > ./feeds.opml.xml
python3 opml-parser.py ./feeds.opml.xml /opt/zola/wasabipesto.com/content/blogroll/table.txt

echo Publishing...

if [ $1 = "prod" ]; then

    cd /opt/zola/wasabipesto.com
    if ! zola build; then exit; fi
    rm -r /opt/nginx/www/wasabipesto.com/* /opt/nginx/www/wasabipesto.com/.??*
    mv public/* public/.??* /opt/nginx/www/wasabipesto.com
    echo Pushed to wasabipesto.com.

else

    cd /opt/zola/wasabipesto.com
    if ! zola build; then exit; fi
    rm -r /opt/nginx/www/beta.wasabipesto.com/* /opt/nginx/www/beta.wasabipesto.com/.??*
    mv public/* public/.??* /opt/nginx/www/beta.wasabipesto.com
    echo Pushed to beta.wasabipesto.com.

fi