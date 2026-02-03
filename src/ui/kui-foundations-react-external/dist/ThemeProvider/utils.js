/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { PREFERS_COLOR_SCHEME_DARK_QUERY, THEME_CLASS_NAMES } from './types.js';

const detectSystemThemePreference = () => {
  if (typeof window === "undefined") return "dark";
  const prefersColorSchemeDark = window.matchMedia(
    PREFERS_COLOR_SCHEME_DARK_QUERY
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
  return theme === "dark" ? THEME_CLASS_NAMES.dark : THEME_CLASS_NAMES.light;
};
const getDensityClassName = (density) => {
  return `nv-density-${density}`;
};
const createSystemThemeListener = (callback) => {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  const mediaQuery = window.matchMedia(PREFERS_COLOR_SCHEME_DARK_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

export { createSystemThemeListener, detectSystemThemePreference, getDensityClassName, getThemeClassName, resolveTheme };
