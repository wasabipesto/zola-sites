import requests
import json
import sys

NOTION_API_KEY = sys.argv[1]
database_ids = {}
database_ids["machines"] = "af70cab8572a46f2a4fe65b6f9ee6c37"

response = requests.post(
    "https://api.notion.com/v1/databases/"+database_ids["machines"]+"/query",
    headers={
        "Authorization": "Bearer "+NOTION_API_KEY,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
        }
    )
data = json.loads(response.text)

categories = set()
machines = []

for machine in data["results"]:
    tags = [i["name"] for i in machine["properties"]["Tags"]["multi_select"]]
    if not "Decommissioned" in tags:
        name = machine["properties"]["Name"]["title"][0]["text"]["content"]
        specs = machine["properties"]["Specs"]["rich_text"][0]["text"]["content"]
        categories.add(tags[0])
        machines.append({"name": name, "tag": tags[0], "specs": specs})
categories = sorted(categories)

lines = []
for cat in categories:
    lines.append("### "+cat)
    lines.append("")
    for machine in machines:
        if machine["tag"] == cat:
            lines.append(machine["name"])
            lines.append(machine["specs"])
            lines.append("")

with open(sys.argv[2], "w") as output:
    [output.write(str(line)+'\n') for line in lines]