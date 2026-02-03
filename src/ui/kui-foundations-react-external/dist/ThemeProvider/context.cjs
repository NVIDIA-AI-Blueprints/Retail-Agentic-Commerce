/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const ThemeContext = react.createContext({
  density: void 0,
  theme: void 0,
  unresolvedTheme: void 0,
  defer: void 0,
  global: void 0,
  setTheme: () => {
  },
  setDensity: () => {
  }
});
const useThemeContext = () => {
  const context = react.useContext(ThemeContext);
  if (!context) {
    throw new Error("ThemeContext must be used within a ThemeProvider");
  }
  return context;
};
const useParentThemeContext = () => {
  return react.useContext(ThemeContext);
};

exports.ThemeContext = ThemeContext;
exports.useParentThemeContext = useParentThemeContext;
exports.useThemeContext = useThemeContext;
