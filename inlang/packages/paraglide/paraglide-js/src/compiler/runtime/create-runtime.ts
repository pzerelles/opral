import type { ProjectSettings } from "@inlang/sdk";
import { tsRuntime } from "./ts-runtime.js";
import { jsdocRuntime } from "./jsdoc-runtime.js";

/**
 * Returns the code for the `runtime.js` module
 */
export function createRuntime(
	settings: Pick<ProjectSettings, "baseLocale" | "locales">,
	emitTs: boolean
): string {
	const runtimeCode = emitTs ? tsRuntime : jsdocRuntime;

	return (
		runtimeCode
			// replace the locales first
			.replace('["<replace>"]', JSON.stringify(settings.locales))
			// then the base locale
			.replace('"<replace>"', JSON.stringify(settings.baseLocale))
	);
}
