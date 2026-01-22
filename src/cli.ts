#!/usr/bin/env node

import { Command } from "commander";
import { csvToJson } from "./commands/csv-to-json";
import { jsonToCsv } from "./commands/json-to-csv";

const program = new Command();

program
	.name("i18n-converter")
	.description("Convert between CSV and JSON translation formats")
	.version("1.0.0");

program
	.command("csv-to-json")
	.description("Convert CSV file to multiple JSON files (one per language)")
	.argument("<input>", "Input CSV file path")
	.option(
		"-l, --languages <languages>",
		"Comma-separated list of language codes (if not provided, will be auto-detected from header)",
	)
	.option(
		"-o, --output-dir <dir>",
		"Output directory for JSON files",
		"./output",
	)
	.option("-f, --fallback <lang>", "Fallback language code")
	.option("--key-column <index>", "Column index for keys (0-based)", "0")
	.action(csvToJson);

program
	.command("json-to-csv")
	.description(
		"Convert JSON file(s) or directory to CSV format with multiple language columns",
	)
	.argument(
		"[inputs...]",
		"Input JSON file path(s) or directory with JSON files",
	)
	.option("-o, --output <file>", "Output CSV file path", "./output.csv")
	.option("-s, --separator <char>", "Key separator for nested keys", ".")
	.action(jsonToCsv);

program.parse();
