/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const ThemeContext = createContext({
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
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("ThemeContext must be used within a ThemeProvider");
  }
  return context;
};
const useParentThemeContext = () => {
  return useContext(ThemeContext);
};

export { ThemeContext, useParentThemeContext, useThemeContext };
