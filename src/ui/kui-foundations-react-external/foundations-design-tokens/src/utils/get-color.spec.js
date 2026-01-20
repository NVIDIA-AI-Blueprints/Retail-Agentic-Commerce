import { describe, it, expect } from "vitest";

import designTokens from "../generated/design-tokens.js";
import { getColor } from "./get-color.js";

const PRIMITIVE_COLORS = Object.entries(designTokens["primitives-color"]);
const THEME_LIGHT_COLORS = Object.entries(designTokens["theme-light"]);
const THEME_DARK_COLORS = Object.entries(designTokens["theme-dark"]);

describe("getColor", () => {
	describe("primitive colors", () => {
		PRIMITIVE_COLORS.forEach(([key, value]) => {
			it(`returns the correct color for ${key}`, () => {
				const result = getColor(key);
				expect(result).toBe(value);
				if (key.includes("translucent")) {
					expect(result).toMatch(/^#[0-9a-fA-F]{8}$/);
				} else {
					expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
				}
			});
		});
	});

	describe("theme colors", () => {
		THEME_LIGHT_COLORS.forEach(([key, token]) => {
			it(`returns raw hex color for light theme by default for ${key}`, () => {
				const result = getColor(key);
				expect(result).toBe(
					designTokens["primitives-color"][token] ||
						designTokens["primitives-color"][
							designTokens["theme-light"][token]
						],
				);
			});
		});
		THEME_DARK_COLORS.forEach(([key, token]) => {
			it(`returns raw hex color for dark theme for ${key}`, () => {
				const result = getColor(key, { theme: "dark" });
				expect(result).toBe(
					designTokens["primitives-color"][token] ||
						designTokens["primitives-color"][designTokens["theme-dark"][token]],
				);
			});
		});
		it("returns the color token for light theme when resolveToRawValue is false", () => {
			THEME_LIGHT_COLORS.forEach(([key, value]) => {
				const result = getColor(key, { resolveToRawValue: false });
				expect(result).toBe(value);
			});
		});
		it("returns the color token for dark theme when resolveToRawValue is false", () => {
			THEME_DARK_COLORS.forEach(([key, value]) => {
				const result = getColor(key, {
					resolveToRawValue: false,
					theme: "dark",
				});
				expect(result).toBe(value);
			});
		});
	});

	describe("edge cases and error handling", () => {
		it("should return null for non-existent colors", () => {
			const nonExistentColors = [
				"--non-existent-color",
				"--invalid-color",
				"--color-invalid",
				"--blue-9999",
				"--gray-9999",
			];

			nonExistentColors.forEach((colorKey) => {
				expect(getColor(colorKey)).toBe(undefined);
				expect(getColor(colorKey, { theme: "light" })).toBe(undefined);
				expect(getColor(colorKey, { theme: "dark" })).toBe(undefined);
			});
		});

		it("should handle empty string input", () => {
			expect(getColor("")).toBe(undefined);
		});

		it("should handle undefined input", () => {
			expect(getColor(undefined)).toBe(undefined);
		});

		it("should handle null input", () => {
			expect(getColor(null)).toBe(undefined);
		});
	});
});
