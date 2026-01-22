import * as fs from "fs";
import * as path from "path";
import { stringify } from "csv-stringify/sync";
import { flattenObject } from "../utils/nested-json";
import { inferLanguageFromFilename } from "../utils/language-inference";

// Type for nested JSON objects
interface NestedJsonObject {
	[key: string]: string | NestedJsonObject;
}

interface FileWithLanguage {
	filepath: string;
	language: string;
}

export async function jsonToCsv(
	inputs: string[],
	options: {
		output?: string;
		separator?: string;
	},
) {
	if (!inputs || inputs.length === 0) {
		console.error("Error: No input files or directory specified");
		process.exit(1);
	}

	const separator = options.separator || ".";

	// Determine input mode: directory or file list
	let filesWithLanguages: FileWithLanguage[] = [];

	if (inputs.length === 1) {
		const input = inputs[0];

		// Check if it's a directory
		if (fs.existsSync(input)) {
			const stats = fs.statSync(input);
			if (stats.isDirectory()) {
				// Directory mode: scan for JSON files
				const jsonFiles = fs
					.readdirSync(input)
					.filter((f) => f.endsWith(".json"))
					.map((f) => path.join(input, f));

				if (jsonFiles.length === 0) {
					console.error(`Error: No JSON files found in directory: ${input}`);
					process.exit(1);
				}

				filesWithLanguages = jsonFiles.map((filepath) => ({
					filepath,
					language: inferLanguageFromFilename(filepath),
				}));
			} else {
				// Single file mode
				filesWithLanguages = [
					{
						filepath: input,
						language: inferLanguageFromFilename(input),
					},
				];
			}
		} else {
			console.error(`Error: Input not found: ${input}`);
			process.exit(1);
		}
	} else {
		// Multiple files mode
		for (const input of inputs) {
			if (!fs.existsSync(input)) {
				console.error(`Error: Input file not found: ${input}`);
				process.exit(1);
			}
			filesWithLanguages.push({
				filepath: input,
				language: inferLanguageFromFilename(input),
			});
		}
	}

	// Read and flatten all JSON files
	const allData: Record<string, Record<string, string>> = {};
	const languages: string[] = [];

	for (const { filepath, language } of filesWithLanguages) {
		languages.push(language);

		const jsonContent = fs.readFileSync(filepath, "utf-8");
		let jsonData: NestedJsonObject;

		try {
			jsonData = JSON.parse(jsonContent) as NestedJsonObject;
		} catch (error) {
			console.error(`Error: Invalid JSON file: ${filepath}`);
			console.error(error);
			process.exit(1);
		}

		const flatData = flattenObject(jsonData, separator);

		// Merge into allData structure: { [key]: { [lang]: value } }
		for (const [key, value] of Object.entries(flatData)) {
			if (!allData[key]) {
				allData[key] = {};
			}
			allData[key][language] = value;
		}
	}

	// Sort languages alphabetically
	languages.sort();

	// Collect all unique keys and sort them
	const allKeys = Array.from(new Set(Object.keys(allData))).sort((a, b) =>
		a.localeCompare(b),
	);

	if (allKeys.length === 0) {
		console.error("Error: No translation keys found in JSON files");
		process.exit(1);
	}

	// Build CSV rows
	const rows: string[][] = [];

	// Header row: key, then languages
	rows.push(["key", ...languages]);

	// Data rows: key, then values for each language
	for (const key of allKeys) {
		const row: string[] = [key];
		for (const lang of languages) {
			// Use empty string if key doesn't exist in this language
			row.push(allData[key][lang] || "");
		}
		rows.push(row);
	}

	// Generate CSV
	const csvContent = stringify(rows);
	const outputPath = options.output || "./output.csv";

	// Ensure output directory exists
	const outputDir = path.dirname(outputPath);
	if (outputDir !== ".") {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	fs.writeFileSync(outputPath, csvContent, "utf-8");

	console.log(`✓ Generated ${outputPath} with ${languages.length} language(s)`);
}
