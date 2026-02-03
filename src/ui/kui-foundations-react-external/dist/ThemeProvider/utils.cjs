/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var types = require('./types.cjs');

const detectSystemThemePreference = () => {
  if (typeof window === "undefined") return "dark";
  const prefersColorSchemeDark = window.matchMedia(
    types.PREFERS_COLOR_SCHEME_DARK_QUERY
  );
  return prefersColorSchemeDark.matches ? "dark" : "light";
};
const resolveTheme = (theme) => {
  if (theme === "system") {
    return detectSystemThemePreference();
  }
  return theme;
};
const getThemeClassName = (theme) => {
  return theme === "dark" ? types.THEME_CLASS_NAMES.dark : types.THEME_CLASS_NAMES.light;
};
const getDensityClassName = (density) => {
  return `nv-density-${density}`;
};
const createSystemThemeListener = (callback) => {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  const mediaQuery = window.matchMedia(types.PREFERS_COLOR_SCHEME_DARK_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

exports.createSystemThemeListener = createSystemThemeListener;
exports.detectSystemThemePreference = detectSystemThemePreference;
exports.getDensityClassName = getDensityClassName;
exports.getThemeClassName = getThemeClassName;
exports.resolveTheme = resolveTheme;
