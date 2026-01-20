import designTokens from "../generated/design-tokens.js";

/**
 * @typedef {keyof typeof designTokens["theme-light"]} ThemeColor
 * @typedef {keyof typeof designTokens["primitives-color"]} PrimitiveColor
 */

/**
 * @remarks
 * A utility function to get the color from the primitive colors object.
 * @param {PrimitiveColor | ThemeColor} color - The color to get.
 * @param {Object} options - The options for the color.
 * @param {"light" | "dark"} [options.theme] - The theme to use. Defaults to "light".
 * @param {boolean} [options.resolveToRawValue] - When true this function will recursively resolve theme colors to a raw hex value. Defaults to true.
 * @returns {string | undefined} The color.
 */
export function getColor(color, options = {}) {
	// handle primitive color tokens
	if (designTokens["primitives-color"][color]) {
		return designTokens["primitives-color"][color];
	}
	const { theme = "light", resolveToRawValue = true } = options;

	const colorFromTheme =
		designTokens[theme === "light" ? "theme-light" : "theme-dark"][color];
	if (!colorFromTheme) {
		return undefined;
	}
	// colorFromTheme can be a primitive color token, or a theme color token that requires further resolution
	return resolveToRawValue
		? getColor(colorFromTheme, { theme, resolveToRawValue })
		: colorFromTheme;
}
