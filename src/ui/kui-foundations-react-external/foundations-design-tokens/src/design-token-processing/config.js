import {
	designTokens as kuiDesignTokens,
	getCssVariable,
	getFromTheme,
} from "../index.js";

export const DARK_MODE_SELECTOR = ".nv-dark";
export const COMPACT_DENSITY_SELECTOR = ".nv-density-compact";
export const SPACIOUS_DENSITY_SELECTOR = ".nv-density-spacious";

export const VARIANTS = {
	dark: `&:where(${DARK_MODE_SELECTOR}, ${DARK_MODE_SELECTOR} *)`,
	"density-compact": `&:where(${COMPACT_DENSITY_SELECTOR}, ${COMPACT_DENSITY_SELECTOR} *)`,
	"density-spacious": `&:where(${SPACIOUS_DENSITY_SELECTOR}, ${SPACIOUS_DENSITY_SELECTOR} *)`,
};

/**
 * For internal use only. This is the Tailwind Theme we use to compile our component CSS. For
 * external use, use `@kui/foundations-tailwind-plugin` instead.
 */
export const COMPONENT_CSS_COMPILER_THEME_CONFIG = {
	fontFamily: Object.entries({
		"--font-sans":
			kuiDesignTokens["primitives-typography"]["--font-family-nvidia-sans"],
		"--font-mono":
			kuiDesignTokens["primitives-typography"]["--font-family-jetbrains-mono"],
	}),
	fontSize: getFromTheme("primitives-typography", "font-size-"),
	fontWeight: getFromTheme("primitives-typography", "font-weight-").filter(
		([key]) => !key.includes("mono-regular"),
	),
	lineHeight: getFromTheme("primitives-typography", "line-height-"),
	letterSpacing: Object.entries(kuiDesignTokens["effects"]["text-styles"])
		.map(([type, value]) => [type, value.letterSpacing])
		.filter(([_, letterSpacing]) => letterSpacing !== undefined)
		.map(([type, letterSpacing]) => [
			`--tracking-${type.replaceAll("/", "-")}`,
			letterSpacing,
		]),
	// colors
	primitiveColors: [
		/**
		 * add these for convenience
		 */
		["--color-black", kuiDesignTokens["primitives-color"]["--gray-1000"]],
		["--color-white", kuiDesignTokens["primitives-color"]["--gray-000"]],
	].concat(
		getFromTheme("primitives-color").sort((a, b) => {
			/**
			 * The order we should sort the colors by in the palette, sorted by hue progression in a colour wheel
			 * Note the color names are in the format of `--color-<color-name>` or `--color-<color-name>-<shade>`
			 */
			const COLOR_ORDER = [
				"brand",
				"red",
				"yellow",
				"green",
				"teal",
				"blue",
				"purple",
				"fuchsia",
				"gray",
				"translucent",
			];
			const aColor = a[0].replace("--", "").split("-")[0];
			const bColor = b[0].replace("--", "").split("-")[0];
			const aOrder = COLOR_ORDER.indexOf(aColor);
			const bOrder = COLOR_ORDER.indexOf(bColor);
			if (aOrder === -1 && bOrder === -1) {
				return aColor.localeCompare(bColor);
			}
			if (aOrder === -1) {
				return 1;
			}
			if (bOrder === -1) {
				return -1;
			}
			return aOrder - bOrder;
		}),
	),
	lightThemeColors: getFromTheme("theme-light"),
	backgroundColors: getFromTheme("theme-light", "-background"),
	foregroundIconColors: getFromTheme("theme-light", ["-foreground", "-icon"]),
	borderColors: getFromTheme("theme-light", "-border"),
	// sizes
	breakpoints: getFromTheme("primitives-size", "breakpoint-").map(
		([varName, value]) => {
			// Tailwind expects breakpoints in rem units to support max-* and min-* breakpoint utilities
			const valueAsRem = Number(value.replace("px", "")) / 16;
			return [varName, valueAsRem + "rem"];
		},
	),
	containerBreakpoints: Object.entries({
		// pulled from the default Tailwind config - these are a reasonable default
		"--container-3xs": "16rem",
		"--container-2xs": "18rem",
		"--container-xs": "20rem",
		"--container-sm": "24rem",
		"--container-md": "28rem",
		"--container-lg": "32rem",
		"--container-xl": "36rem",
		"--container-2xl": "42rem",
		"--container-3xl": "48rem",
		"--container-4xl": "56rem",
		"--container-5xl": "64rem",
		"--container-6xl": "72rem",
		"--container-7xl": "80rem",
	}),
	borderRadius: getFromTheme("primitives-size", "radius-"),
	borderWidth: getFromTheme("primitives-size", "border-"),
	semanticSizes: getFromTheme("density-standard", "spacing-"),
	// effects
	shadows: getFromTheme("effects", "--shadows"),
	backdropFilters: getFromTheme(
		"effects",
		"backdrop-filters-surface-glass-blur",
	),
	animation: {
		pulse: {
			animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			keyframes: {
				"50%": { opacity: "0.5" },
			},
			keyframesCss: `@keyframes pulse {
			50% { opacity: 0.5; }
		}`,
		},
		spin: {
			animation: "spin 1s linear infinite",
			keyframes: {
				to: { transform: "rotate(360deg)" },
			},
			keyframesCss: `@keyframes spin {
				to { transform: rotate(360deg); }
			}`,
		},
	},
	transitionDuration: {
		150: "150ms",
		200: "200ms",
		250: "250ms",
		300: "300ms",
	},
	transitionTimingFunction: {
		out: "cubic-bezier(0.4, 0, 0.2, 1)",
	},
};

export const CSS_COMPILER_THEME = getCssCompilerTheme().themeCss;

export function getCssCompilerTheme() {
	const THEME_PRIMITIVES = [
		// `--size-100` is the base spacing value
		["--spacing", kuiDesignTokens["primitives-size"]["--size-100"]],
		// color palette
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.primitiveColors.map(
			processThemeEntries,
		),
		// typography
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.fontFamily,
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.fontSize.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.fontWeight.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.lineHeight.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.letterSpacing.map(
			processThemeEntries,
		),
		// sizes
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.breakpoints.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.containerBreakpoints.map(
			processThemeEntries,
		),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.borderWidth.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.borderRadius.map(
			processThemeEntries,
		),
		// effects
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.shadows.map(processThemeEntries),
		...COMPONENT_CSS_COMPILER_THEME_CONFIG.backdropFilters.map(
			processThemeEntries,
		),
		...Object.entries(COMPONENT_CSS_COMPILER_THEME_CONFIG.animation).map(
			([key, value]) => [
				`--animate-${key}`,
				value.animation,
				value.keyframesCss,
			],
		),
		...Object.entries(
			COMPONENT_CSS_COMPILER_THEME_CONFIG.transitionDuration,
		).map(([key, value]) => [`--transition-duration-${key}`, value]),
		...Object.entries(
			COMPONENT_CSS_COMPILER_THEME_CONFIG.transitionTimingFunction,
		).map(([key, value]) => [`--ease-${key}`, value]),
	];
	const lightTheme = COMPONENT_CSS_COMPILER_THEME_CONFIG.lightThemeColors
		.map(processThemeEntries)
		.sort();
	const darkTheme = getFromTheme("theme-dark").map(processThemeEntries).sort();
	const standardDensity =
		getFromTheme("density-standard").map(processThemeEntries);

	const textUtilities = Object.entries(
		kuiDesignTokens["effects"]["text-styles"],
	).map(([type, value]) => generateTextUtility(type, value));

	const themeCss = `
${Object.entries(VARIANTS)
	.map(([variant, selector]) => `@custom-variant ${variant} (${selector});`)
	.join("\n")}

/* Primitive Theme Properties - Color Palette, Typography, Sizes */
@theme {
  ${THEME_PRIMITIVES.map(([token, value, additional = ""]) => `${token}: ${value};${additional && `\n${additional}`}`).join("\n")}
}

/* Themed Properties - CSS variables that are theme dependent */
@theme {
  ${lightTheme.map(([token, value]) => `${token}: ${value};`).join("\n")}
}

/* Themed Density Properties - CSS variables that are theme dependent */
@theme {
	${standardDensity.map(([token, value]) => `${token}: ${value};`).join("\n")}
}

/* Text Utilities */
${textUtilities.map(({ cssUtility }) => cssUtility).join("\n")}
`;

	return {
		primitives: THEME_PRIMITIVES,
		lightTheme,
		darkTheme,
		densityCompact: getFromTheme("density-compact").map(processThemeEntries),
		densitySpacious: getFromTheme("density-spacious").map(processThemeEntries),
		densityStandard: standardDensity,
		textUtilities,
		themeCss,
	};
}

/********************
 * Utility functions
 ********************/

/**
 * Converts values from the design tokens over to the format that Tailwind expects.
 */
export function processThemeEntries([token, value]) {
	// Regex to find all instances of CSS variables (--anything)
	const TOKENS_REGEX = /--[a-zA-Z0-9-]+/g;
	return [
		getCssVariable(token).declaration,
		typeof value === "string"
			? // Use regex to find all instances of CSS variables (--anything) and replace them with var()
				// references to handle nested tokens i.e. blur(var(--size-100))
				value.replace(TOKENS_REGEX, (match) => getCssVariable(match).reference)
			: value,
	];
}

function generateTextUtility(type, value) {
	const { fontFamily, fontSize, fontWeight, lineHeight } = value;
	const twFontFamily = fontFamily.includes("nvidia-sans")
		? "font-sans"
		: fontFamily.includes("jetbrains-mono")
			? "font-mono"
			: "";
	const twFontSize = getCssVariable(fontSize).declaration;
	const twFontWeight = getCssVariable(fontWeight).declaration.replace(
		"--font-weight-mono-regular",
		"--font-weight-regular",
	);
	const twLineHeight =
		typeof lineHeight === "string"
			? `leading-(${getCssVariable(lineHeight).declaration})`
			: `leading-[${lineHeight}]`;
	let utilityName = type.replaceAll("/", "-");
	if (!utilityName.startsWith("text-")) {
		utilityName = `text-${utilityName}`;
	}
	return {
		utilityName,
		cssUtility: `@utility ${utilityName} { @apply ${twFontFamily} text-(size:${twFontSize}) font-(${twFontWeight}) ${twLineHeight}; }`,
		pluginUtility: `.${utilityName} { @apply ${utilityName}; }`,
	};
}
