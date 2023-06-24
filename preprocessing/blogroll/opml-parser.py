# heavily borrowed from ersei

from lxml import etree
import sys

favorites = []
ignore_patterns = ["rss-bridge", "kill-the-newsletter", "memberfulcontent"]

with open(sys.argv[1], "r") as file:
    xml = file.read()

root = etree.fromstring(bytes(xml, encoding="utf8"))
categories = root.getchildren()[1].getchildren()
lines = [
    "| Page | Feed |",
    "| --- | --- |",
]

for category in categories:
    if not category == categories[0]:
        lines.append("| | |")
    lines.append("| **"+category.attrib.get("text")+"** | |")
    for feed in category.getchildren():
        name = feed.attrib.get("text").replace("|", "\\|") # escape pipes
        rss = feed.attrib.get("xmlUrl")
        url = feed.attrib.get("htmlUrl")
        if name in favorites:
            name = "★ "+name
        line = "| ["+name+"]("+url+") | [RSS Feed]("+rss+") |"
        for pattern in ignore_patterns:
            if pattern in rss:
                line = "| "+name+" | Unavailable |"
        lines.append(line)

with open(sys.argv[2], "w") as output:
    [output.write(str(line)+'\n') for line in lines]