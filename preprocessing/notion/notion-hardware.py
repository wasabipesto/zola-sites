import requests
import json
import sys

response = requests.post(
    "https://api.notion.com/v1/databases/af70cab8572a46f2a4fe65b6f9ee6c37/query",
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
    tags = [i["name"] for i in item["properties"]["Tags"]["multi_select"]]
    specs = item["properties"]["Specs"]["rich_text"][0]["text"]["content"]
    if not "Decommissioned" in tags:
        categories.add(tags[0])
        items.append({"name": name, "tag": tags[0], "specs": specs})

for category in sorted(categories):
    lines.append("### " + category)
    lines.append("")
    for item in items:
        if item["tag"] == category:
            lines.append(item["name"])
            lines.append(item["specs"])
            lines.append("")

with open(sys.argv[2], "w") as output:
    [output.write(str(line) + "\n") for line in lines]
print("Successfully written to " + sys.argv[2])
