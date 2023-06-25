import requests
import json
import sys

response = requests.post(
    "https://api.notion.com/v1/databases/588b7192cefe47588ab0166c8579f081/query",
    headers={
        "Authorization": "Bearer "+sys.argv[1],
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    },
    json={
        "sorts": [{
            "property": "Average Rating",
            "direction": "descending"
        }]
    }
)
data = json.loads(response.text)

categories = set()
items = []
lines = []

for item in data["results"]:
    name = item["properties"]["Title"]["title"][0]["text"]["content"]
    category = item["properties"]["Type"]["select"]["name"]
    if category == "Book" and len(item["properties"]["Artist/Developer"]["rich_text"]):
        name += ", "+item["properties"]["Artist/Developer"]["rich_text"][0]["text"]["content"]
    rating = item["properties"]["Average Rating"]["formula"]["number"]
    categories.add(category)
    items.append({"name": name, "category": category, "rating": rating})

for category in sorted(categories):
    if category[len(category)-1] != "s":
        lines.append("### "+category+"s")
    else:
        lines.append("### "+category)
    lines.append("")
    for item in items:
        if item["category"] == category:
            lines.append("- "+item["name"])
    lines.append("")

with open(sys.argv[2], "w") as output:
    [output.write(str(line)+'\n') for line in lines]
print("Successfully written to "+sys.argv[2])