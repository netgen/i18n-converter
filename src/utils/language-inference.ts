import * as path from "path";

/**
 * Infer language code from filename
 * Assumes language code is the filename without extension
 * Examples: en.json -> en, en-US.json -> en-US, hr.json -> hr
 *
 * @param filepath - Full file path or just filename
 * @returns Language code extracted from filename
 */
export function inferLanguageFromFilename(filepath: string): string {
	const filename = path.basename(filepath);
	const languageCode = filename.replace(/\.json$/i, "");

	if (!languageCode) {
		throw new Error(`Cannot infer language from filename: ${filename}`);
	}

	return languageCode;
}
