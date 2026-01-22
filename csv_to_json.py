import csv
import json
import os


dir = os.path.dirname(os.path.abspath(__file__))

INPUT_CSV = f"{dir}/input/input.csv"
HR_OUTPUT_JSON = f"{dir}/output/hr_output.json"
SL_OUTPUT_JSON = f"{dir}/output/sl_output.json"
RS_OUTPUT_JSON = f"{dir}/output/rs_output.json"


def process_row(row):
    keys = row[0].split(".")
    value_hr = row[1]
    value_sl = row[2]
    value_rs = row[3] if len(row) > 3 else None
    return keys, value_hr, value_sl, value_rs


def build_json(data, language):
    result = {}
    for keys, value in data.items():
        current = result
        for key in keys[:-1]:
            current = current.setdefault(key, {})
        current[keys[-1]] = (
            value[language] if value[language] is not None else value["hr"]
        )
    return result


def generate_json_files(csv_file):
    data = {}
    with open(csv_file, newline="", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            keys, value_hr, value_sl, value_rs = process_row(row)
            data[tuple(keys)] = {"hr": value_hr, "sl": value_sl, "rs": value_rs}

    for language in ["hr", "sl", "rs"]:
        json_data = build_json(data, language)
        with open(
            f"{dir}/output/output_{language}.json",
            "w",
            encoding="utf-8",
        ) as outfile:
            json.dump(json_data, outfile, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    generate_json_files(INPUT_CSV)
