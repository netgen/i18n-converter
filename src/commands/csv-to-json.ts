import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { buildNestedJson } from "../utils/nested-json";

export async function csvToJson(
	inputPath: string,
	options: {
		languages?: string;
		outputDir?: string;
		fallback?: string;
		keyColumn?: string;
	},
) {
	const outputDir = options.outputDir || "./output";
	const keyColumnIndex = parseInt(options.keyColumn || "0", 10);

	// Validate input file exists
	if (!fs.existsSync(inputPath)) {
		console.error(`Error: Input file not found: ${inputPath}`);
		process.exit(1);
	}

	// Read CSV
	const csvContent = fs.readFileSync(inputPath, "utf-8");
	const rows = parse(csvContent, {
		skip_empty_lines: true,
		relax_column_count: true,
	});

	if (rows.length === 0) {
		console.error("Error: CSV file is empty");
		process.exit(1);
	}

	// Determine languages and data rows
	let languages: string[];
	let dataRows: string[][];

	if (options.languages) {
		// Languages provided: skip first row, use provided languages
		languages = options.languages.split(",").map((l) => l.trim());
		dataRows = rows.length > 0 ? rows.slice(1) : rows;
	} else {
		// No languages provided: auto-detect from first row (header)
		if (rows.length === 0) {
			console.error("Error: CSV file is empty");
			process.exit(1);
		}

		const headerRow = rows[0];
		// First column is key, rest are languages
		const detectedLanguages = headerRow
			.slice(keyColumnIndex + 1)
			.filter((col: string) => col && col.toLowerCase() !== "key")
			.map((col: string) => col.trim());

		if (detectedLanguages.length === 0) {
			console.error(
				"Error: Could not detect languages from header row. Please provide --languages option.",
			);
			process.exit(1);
		}

		languages = detectedLanguages;
		dataRows = rows.slice(1); // Skip header row
	}

	if (dataRows.length === 0) {
		console.error("Error: No data rows found in CSV file");
		process.exit(1);
	}

	const fallbackLang = options.fallback || languages[0];

	// Build data structure: { [keyPath]: { [lang]: value } }
	const data: Record<string, Record<string, string>> = {};

	for (const row of dataRows) {
		const keyPath = row[keyColumnIndex];
		if (!keyPath) continue;

		const values: Record<string, string> = {};
		languages.forEach((lang, index) => {
			const colIndex = keyColumnIndex + 1 + index;
			values[lang] = row[colIndex] || "";
		});

		data[keyPath] = values;
	}

	// Ensure output directory exists
	fs.mkdirSync(outputDir, { recursive: true });

	// Generate JSON for each language
	for (const lang of languages) {
		const jsonData = buildNestedJson(data, lang, fallbackLang);
		const outputPath = path.join(outputDir, `${lang}.json`);

		fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");

		console.log(`✓ Generated ${outputPath}`);
	}
}
