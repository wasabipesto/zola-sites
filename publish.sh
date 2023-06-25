#!/bin/bash

source /opt/zola/.env

echo Preprocessing...

output_path="/opt/zola/wasabipesto.com/content/blogroll/data.txt"
docker exec freshrss ./cli/export-opml-for-user.php --user justin > /opt/zola/preprocessing/blogroll/feeds.opml.xml
python3 /opt/zola/preprocessing/blogroll/opml-parser.py /opt/zola/preprocessing/blogroll/feeds.opml.xml ${output_path}
echo Pushed blogroll data to ${output_path}.

output_path="/opt/zola/wasabipesto.com/content/machines/data.txt"
python3 /opt/zola/preprocessing/notion/notion-machines.py $NOTION_API_KEY ${output_path}
echo Pushed machine data to ${output_path}.

output_path="/opt/zola/wasabipesto.com/content/media/data.txt"
python3 /opt/zola/preprocessing/notion/notion-media.py $NOTION_API_KEY ${output_path}
echo Pushed media data to ${output_path}.

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
