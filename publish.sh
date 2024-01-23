#!/bin/bash

source /opt/zola/.env

echo Preprocessing...
docker exec freshrss ./cli/export-opml-for-user.php --user justin > /opt/zola/preprocessing/blogroll/feeds.opml.xml
python3 /opt/zola/preprocessing/blogroll/opml-parser.py /opt/zola/preprocessing/blogroll/feeds.opml.xml /opt/zola/wasabipesto.com/content/blogroll/data.txt
python3 /opt/zola/preprocessing/notion/notion-hardware.py $NOTION_API_KEY /opt/zola/wasabipesto.com/content/hardware/data.txt
python3 /opt/zola/preprocessing/notion/notion-software.py $NOTION_API_KEY /opt/zola/wasabipesto.com/content/software/data.txt
python3 /opt/zola/preprocessing/notion/notion-media.py $NOTION_API_KEY /opt/zola/wasabipesto.com/content/media/data.txt

render () {
    echo
    echo Building $1...
    cd /opt/zola/$1
    if ! zola build; then exit 1; fi
    rm -r /opt/nginx/www/$2/*
    rm -r /opt/nginx/www/$2/.??* &> /dev/null
    mv public/* /opt/nginx/www/$2
    mv public/.??* /opt/nginx/www/$2 &> /dev/null
    echo Pushed to https://$2.
}

render "wasabipesto.com" "beta.wasabipesto.com"
read -rsp $'Press any key to proceed...\n' -n1 key
render "wasabipesto.com" "wasabipesto.com"
render "blorbo.city" "blorbo.city"
render "eschaton.city" "eschaton.city"
