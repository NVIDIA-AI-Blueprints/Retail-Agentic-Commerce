/**
 * @typedef {typeof kuiDesignTokens} KuiDesignTokens
 */
import kuiDesignTokens from "../generated/design-tokens.js";

/**
 * @typedef {keyof typeof kuiDesignTokens} Collection
 * @param {Collection | Collection[]} collection
 * @param {string | string[]} [match]
 * @returns {Array<[string, string]>}
 */
export function getFromTheme(collection, match = "") {
	if (Array.isArray(collection)) {
		return collection.flatMap((c) => getFromTheme(c, match));
	}
	return Object.entries(kuiDesignTokens[collection]).filter(([variable]) =>
		Array.isArray(match)
			? match.some((m) => variable.includes(m))
			: variable.includes(match),
	);
}

/**
 * @param {string} token - the design token to get the CSS variable for
 * @returns {{ reference: string; declaration: string }}
 */
export function getCssVariable(token) {
	if (!token.startsWith("--")) {
		throw new Error(`Token ${token} does not start with --`);
	}
	let cssVariableKey = token;
	/** @type {Partial<Record<keyof typeof import("../generated/design-tokens.js").default, string>>} */
	const COLLECTION_PROPERTY_MAP = {
		"primitives-color": "color",
	};
	const tokenCollection = Object.entries(kuiDesignTokens).find(
		([, collectionTokens]) => Object.keys(collectionTokens).includes(token),
	)?.[0];
	if (tokenCollection && COLLECTION_PROPERTY_MAP[tokenCollection]) {
		cssVariableKey = `--${COLLECTION_PROPERTY_MAP[tokenCollection]}-${token.substring(2)}`;
	}

	// size is a special case, we should use the inlined value instead of the CSS variable
	if (token.includes("--size-")) {
		const magnitude = Number(token.replace("--size-", "")) / 100;
		return {
			reference: kuiDesignTokens[tokenCollection][token],
			declaration: token,
			calcValue: `calc(var(--spacing) * ${magnitude})`,
		};
	}
	if (cssVariableKey.includes("font-size-")) {
		cssVariableKey = cssVariableKey.replace("font-size-", "text-");
	}
	if (cssVariableKey.includes("line-height-")) {
		cssVariableKey = cssVariableKey.replace("line-height-", "leading-");
	}
	if (cssVariableKey.includes("brand-brand")) {
		cssVariableKey = cssVariableKey.replace("brand-brand", "brand");
	}
	if (cssVariableKey.includes("shadows-elevation")) {
		cssVariableKey = cssVariableKey.replace("shadows-elevation-", "shadow-");
	}
	if (cssVariableKey.includes("shadows-surface")) {
		cssVariableKey = cssVariableKey.replace("shadows-surface-", "shadow-");
	}
	if (cssVariableKey === "--backdrop-filters-surface-glass-blur") {
		cssVariableKey = "--blur-surface-glass";
	}
	if (cssVariableKey.endsWith("-border")) {
		cssVariableKey = cssVariableKey
			.replace("-border", "")
			.replace("color-", "border-color-");
	}
	if (cssVariableKey.endsWith("-background")) {
		cssVariableKey = cssVariableKey
			.replace("-background", "")
			.replace("color-", "background-color-");
	}
	if (
		cssVariableKey.endsWith("-foreground") ||
		cssVariableKey.endsWith("-icon")
	) {
		cssVariableKey = cssVariableKey
			.replace("-foreground", "")
			.replace("color-", "text-color-");
	}

	return {
		reference: `var(${cssVariableKey})`,
		declaration: cssVariableKey,
	};
}

/**
 * Returns all possible values for a given token indexed by collection.
 * @param {keyof KuiDesignTokens["density-standard"] | keyof KuiDesignTokens["effects"] | keyof KuiDesignTokens["primitives-color"] | keyof KuiDesignTokens["primitives-size"] | keyof KuiDesignTokens["primitives-typography"] | keyof KuiDesignTokens["theme-light"]} token
 * @returns {Record<Collection, string>}
 */
export function getAllValues(token) {
	const collectionsWithToken = Object.entries(kuiDesignTokens)
		.filter(([, collectionTokens]) =>
			Object.keys(collectionTokens).includes(token),
		)
		.map(([collection]) => collection);
	if (collectionsWithToken.length === 0) {
		console.warn(`Token ${token} not found in any collection`);
		return "";
	}
	return Object.fromEntries(
		collectionsWithToken.map((collection) => [
			collection,
			kuiDesignTokens[collection][token],
		]),
	);
}
