import requests
import json
import sys

response = requests.post(
    "https://api.notion.com/v1/databases/d1cf2e137fe44864bf4dcd5a7a4d1864/query",
    headers={
        "Authorization": "Bearer " + sys.argv[1],
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
    },
    json={"sorts": [{"property": "Name", "direction": "ascending"}]},
)
data = json.loads(response.text)

categories = set()
items = []
lines = []

for item in data["results"]:
    name = item["properties"]["Name"]["title"][0]["text"]["content"]
    url = item["properties"]["URL"]["url"]
    hosts = [i["name"] for i in item["properties"]["Hosts"]["multi_select"]]
    category = item["properties"]["Category"]["select"]
    if not "None" in hosts and category != None:
        category = category["name"]
        categories.add(category)
        items.append({"name": name, "url": url, "category": category})

for category in sorted(categories):
    lines.append("### " + category)
    lines.append("")
    for item in items:
        if item["category"] == category:
            if item["url"] != None:
                lines.append("- [" + item["name"] + "](" + item["url"] + ")")
            else:
                lines.append("- " + item["name"])
    lines.append("")

with open(sys.argv[2], "w") as output:
    [output.write(str(line) + "\n") for line in lines]
print("Successfully written to " + sys.argv[2])
