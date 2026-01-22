import json
import csv
import os

dir = os.path.dirname(os.path.abspath(__file__))

INPUT_JSON_FILE = f"{dir}/input/input.json"
OUTPUT_CSV_FILE = f"{dir}/output/output.csv"


def flatten_dict(d, parent_key="", sep="."):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def convert_to_csv(json_file, output_file):
    with open(json_file, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    flat_data = flatten_dict(json_data)
    flat_data_sorted = flat_data.items()

    with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        for key, value in flat_data_sorted:
            writer.writerow([key, value])


if __name__ == "__main__":
    input_json_file = INPUT_JSON_FILE
    output_csv_file = OUTPUT_CSV_FILE

    convert_to_csv(input_json_file, output_csv_file)
