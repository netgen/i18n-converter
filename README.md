# i18n-converter

A CLI tool for converting between CSV and JSON translation formats for i18n applications.

## Installation

### Using npx (recommended)

No installation needed! Just use `npx`:

```bash
npx i18-converter <command>
```

### Local installation

```bash
npm install -g i18-converter
```

Or install locally in your project:

```bash
npm install i18-converter
```

## Assumptions

The tool makes the following assumptions:

- **JSON filenames**: When using `json-to-csv` with a directory or file list, language codes are inferred from filenames. Files should be named with the language code as the filename (e.g., `en.json`, `hr.json`, `de.json`). The language code is extracted by removing the `.json` extension.
- **CSV header row**: When using `csv-to-json` without the `--languages` option, the first row is assumed to be a header containing the key column and language codes (e.g., `key,en,hr,de`).

## Usage

### CSV to JSON

Convert a CSV file to multiple JSON files (one per language):

```bash
# Auto-detect languages from header row
npx i18-converter csv-to-json input.csv --output-dir ./output

# Or specify languages explicitly (first row will be skipped)
npx i18-converter csv-to-json input.csv --languages hr,sl,rs --output-dir ./output
```

**Options:**
- `-l, --languages <languages>`: Comma-separated list of language codes (optional - if not provided, languages are auto-detected from the header row)
- `-o, --output-dir <dir>`: Output directory for JSON files (default: `./output`)
- `-f, --fallback <lang>`: Fallback language code (defaults to first language)
- `--key-column <index>`: Column index for keys (0-based, default: `0`)

**Behavior:**
- **Without `--languages`**: The first row is treated as a header. Languages are auto-detected from the header columns (after the key column), and the header row is skipped when processing data.
- **With `--languages`**: The first row is skipped (treated as header), and the provided languages are used.

**Examples:**
```bash
# Auto-detect from header (recommended)
npx i18-converter csv-to-json ./translations.csv -o ./locales

# Explicit languages (skip header row)
npx i18-converter csv-to-json input.csv -l en,fr,de -o ./locales

# With custom key column and fallback
npx i18-converter csv-to-json input.csv -l hr,sl,rs --key-column 0 -f hr
```

**CSV Format:**
The CSV should have the key in the first column (or specified column), followed by translation columns for each language. If using auto-detection, include a header row:

```csv
key,hr,sl,rs
common.hello,Hello,Hej,Здравствуйте
common.goodbye,Goodbye,Hej då,До свидания
nested.deep.key,Value,Value,Value
```

### JSON to CSV

Convert JSON file(s) or directory to CSV format with multiple language columns:

```bash
# Convert directory (auto-detects all JSON files and languages from filenames)
npx i18-converter json-to-csv ./locales --output output.csv

# Convert multiple files explicitly
npx i18-converter json-to-csv en.json hr.json de.json --output output.csv
```

**Options:**
- `-o, --output <file>`: Output CSV file path (default: `./output.csv`)
- `-s, --separator <char>`: Key separator for nested keys (default: `.`)

**Behavior:**
- **Directory input**: Scans the directory for all `*.json` files and auto-detects language codes from filenames (e.g., `en.json` → `en`, `hr.json` → `hr`)
- **File list input**: Processes the specified files and auto-detects languages from each filename
- Languages are sorted alphabetically in the output CSV

**Note:** The tool assumes JSON files are named with language codes as the filename (without extension). For example:
- ✅ `en.json` → language code: `en`
- ✅ `hr.json` → language code: `hr`
- ✅ `en-US.json` → language code: `en-US`
- ❌ `translations_en.json` → language code: `translations_en` (not recommended)

**Examples:**
```bash
# Convert all JSON files in a directory
npx i18-converter json-to-csv ./locales/common -o ./translations/common.csv

# Convert specific files
npx i18-converter json-to-csv en.json hr.json de.json -o output.csv

# With custom separator
npx i18-converter json-to-csv input.json -o output.csv -s _
```

**Input JSON Format:**
Nested JSON objects are flattened using dot notation. Each language file should have the same structure:

```json
{
  "common": {
    "hello": "Hello",
    "goodbye": "Goodbye"
  },
  "nested": {
    "deep": {
      "key": "Value"
    }
  }
}
```

**Output CSV Format:**
The CSV includes a header row with `key` and language columns, followed by data rows:

```csv
key,en,hr,de
common.hello,Hello,Hej,Hallo
common.goodbye,Goodbye,Hej då,Auf Wiedersehen
nested.deep.key,Value,Vrijednost,Wert
```

## Features

- ✅ Support for arbitrary number of languages
- ✅ Auto-detection of languages from CSV headers or JSON filenames
- ✅ Multiple input modes: single file, multiple files, or directory scanning
- ✅ Configurable input/output paths
- ✅ Fallback language support
- ✅ Bidirectional conversion (CSV ↔ JSON)
- ✅ Nested JSON structure support
- ✅ Works with `npx` (no installation required)
- ✅ Cross-platform (Windows, macOS, Linux)

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally (after build)
node dist/cli.js csv-to-json input.csv
node dist/cli.js json-to-csv ./locales -o output.csv
```

## License

ISC
