import json
import os

def append_to_jsonl(json_dat):

    # Create the logs directory if it doesn't exist
    os.makedirs("logs/jsonl", exist_ok=True)

    # Create a timestamp for the filename
    filename = f"logs/jsonl/created.jsonl"

    # Append the JSON data to the file
    with open(filename, "a") as f:
        f.write(json.dumps(json_dat, ensure_ascii=False) + "\n")