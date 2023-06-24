#!/bin/bash

echo Preprocessing...

cd /opt/zola/preprocessing/blogroll
output_path="/opt/zola/wasabipesto.com/content/blogroll/table.txt"
docker exec freshrss ./cli/export-opml-for-user.php --user justin > ./feeds.opml.xml
python3 opml-parser.py ./feeds.opml.xml ${output_path}
echo Pushed blogroll to ${output_path}.

render () {
    echo
    echo Building $1...
    cd /opt/zola/$1
    if ! zola build; then exit; fi
    rm -r /opt/nginx/www/$2/*
    rm -r /opt/nginx/www/$2/.??* &> /dev/null
    mv public/* /opt/nginx/www/$2
    mv public/.??* /opt/nginx/www/$2 &> /dev/null
    echo Pushed to $2.
}

render "wasabipesto.com" "wasabipesto.com"
render "blorbo.city" "blorbo.city"