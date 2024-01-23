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
)
data = json.loads(response.text)

categories = set()
machines = []
lines = []

for machine in data["results"]:
    tags = [i["name"] for i in machine["properties"]["Tags"]["multi_select"]]
    if not "Decommissioned" in tags:
        name = machine["properties"]["Name"]["title"][0]["text"]["content"]
        specs = machine["properties"]["Specs"]["rich_text"][0]["text"]["content"]
        categories.add(tags[0])
        machines.append({"name": name, "tag": tags[0], "specs": specs})

for category in sorted(categories):
    lines.append("### " + category)
    lines.append("")
    for machine in machines:
        if machine["tag"] == category:
            lines.append(machine["name"])
            lines.append(machine["specs"])
            lines.append("")

with open(sys.argv[2], "w") as output:
    [output.write(str(line) + "\n") for line in lines]
print("Successfully written to " + sys.argv[2])
