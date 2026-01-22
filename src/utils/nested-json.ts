// Type for nested JSON objects (can contain strings or nested objects)
interface NestedJsonObject {
	[key: string]: string | NestedJsonObject;
}

/**
 * Build nested JSON structure from flat key-value pairs
 * @param data - Object with dot-separated keys and language values
 * @param targetLang - Target language code
 * @param fallbackLang - Fallback language code if target is missing
 * @returns Nested JSON object
 */
export function buildNestedJson(
	data: Record<string, Record<string, string>>,
	targetLang: string,
	fallbackLang: string,
): NestedJsonObject {
	const result: NestedJsonObject = {};

	for (const [keyPath, translations] of Object.entries(data)) {
		const keys = keyPath.split(".");
		const value = translations[targetLang] || translations[fallbackLang] || "";

		let current: NestedJsonObject = result;
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!current[key]) {
				current[key] = {};
			}
			const next = current[key];
			if (typeof next === "object") {
				current = next;
			} else {
				// This shouldn't happen in normal flow, but handle it
				current[key] = {};
				current = current[key] as NestedJsonObject;
			}
		}
		current[keys[keys.length - 1]] = value;
	}

	return result;
}

/**
 * Flatten nested JSON object to flat key-value pairs
 * @param obj - Nested JSON object
 * @param separator - Separator for nested keys (default: '.')
 * @param parentKey - Parent key for recursion
 * @returns Flat object with dot-separated keys
 */
export function flattenObject(
	obj: NestedJsonObject,
	separator: string = ".",
	parentKey: string = "",
): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const newKey = parentKey ? `${parentKey}${separator}${key}` : key;

		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			Object.assign(result, flattenObject(value, separator, newKey));
		} else {
			result[newKey] = String(value);
		}
	}

	return result;
}
