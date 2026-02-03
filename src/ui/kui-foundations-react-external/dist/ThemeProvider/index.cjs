/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var ThemeProvider_js = require('./components/base/ThemeProvider.cjs');
var constants_js = require('./constants.cjs');
var context_js = require('./context.cjs');
var hooks_js = require('./hooks.cjs');
var types_js = require('./types.cjs');
var utils_js = require('./utils.cjs');



Object.defineProperty(exports, "ThemeProvider", {
  enumerable: true,
  get: function () { return ThemeProvider_js.ThemeProvider; }
});
Object.defineProperty(exports, "ThemeProviderTestIds", {
  enumerable: true,
  get: function () { return constants_js.ThemeProviderTestIds; }
});
Object.defineProperty(exports, "ThemeContext", {
  enumerable: true,
  get: function () { return context_js.ThemeContext; }
});
Object.defineProperty(exports, "useParentThemeContext", {
  enumerable: true,
  get: function () { return context_js.useParentThemeContext; }
});
Object.defineProperty(exports, "useThemeContext", {
  enumerable: true,
  get: function () { return context_js.useThemeContext; }
});
Object.defineProperty(exports, "useTheme", {
  enumerable: true,
  get: function () { return hooks_js.useTheme; }
});
Object.defineProperty(exports, "useThemeManager", {
  enumerable: true,
  get: function () { return hooks_js.useThemeManager; }
});
Object.defineProperty(exports, "DENSITY_CLASS_NAMES", {
  enumerable: true,
  get: function () { return types_js.DENSITY_CLASS_NAMES; }
});
Object.defineProperty(exports, "PREFERS_COLOR_SCHEME_DARK_QUERY", {
  enumerable: true,
  get: function () { return types_js.PREFERS_COLOR_SCHEME_DARK_QUERY; }
});
Object.defineProperty(exports, "THEME_CLASS_NAMES", {
  enumerable: true,
  get: function () { return types_js.THEME_CLASS_NAMES; }
});
Object.defineProperty(exports, "createSystemThemeListener", {
  enumerable: true,
  get: function () { return utils_js.createSystemThemeListener; }
});
Object.defineProperty(exports, "detectSystemThemePreference", {
  enumerable: true,
  get: function () { return utils_js.detectSystemThemePreference; }
});
Object.defineProperty(exports, "getDensityClassName", {
  enumerable: true,
  get: function () { return utils_js.getDensityClassName; }
});
Object.defineProperty(exports, "getThemeClassName", {
  enumerable: true,
  get: function () { return utils_js.getThemeClassName; }
});
Object.defineProperty(exports, "resolveTheme", {
  enumerable: true,
  get: function () { return utils_js.resolveTheme; }
});
