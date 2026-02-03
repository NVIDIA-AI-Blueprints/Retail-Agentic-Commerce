/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { forwardRef, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { ThemeProviderTestIds } from '../../constants.js';
import { useParentThemeContext, ThemeContext } from '../../context.js';
import { useThemeManager } from '../../hooks.js';
import { THEME_CLASS_NAMES, DENSITY_CLASS_NAMES } from '../../types.js';
import { detectSystemThemePreference } from '../../utils.js';

const themeProvider = cva(null, {
  variants: {
    density: {
      spacious: DENSITY_CLASS_NAMES.spacious,
      compact: DENSITY_CLASS_NAMES.compact,
      standard: DENSITY_CLASS_NAMES.standard
    },
    theme: {
      light: THEME_CLASS_NAMES.light,
      dark: THEME_CLASS_NAMES.dark,
      default: ""
    }
  },
  defaultVariants: {
    density: "standard",
    theme: "default"
  }
});
const ThemeProvider = forwardRef(
  ({
    className,
    density,
    theme,
    defer,
    global = false,
    target = "html",
    asChild,
    ...props
  }, ref) => {
    const parentContext = useParentThemeContext();
    const {
      density: effectiveDensity,
      defer: effectiveDefer,
      resolvedTheme,
      unresolvedTheme,
      updateTheme,
      updateDensity
    } = useThemeManager({
      global,
      target,
      initialTheme: theme,
      initialDensity: density,
      parentContext,
      defer
    });
    const contextValue = useMemo(
      () => ({
        density: effectiveDensity,
        unresolvedTheme,
        theme: resolvedTheme ?? detectSystemThemePreference(),
        defer: effectiveDefer,
        global,
        setTheme: updateTheme,
        setDensity: updateDensity
      }),
      [
        effectiveDensity,
        effectiveDefer,
        unresolvedTheme,
        resolvedTheme,
        global,
        updateTheme,
        updateDensity
      ]
    );
    const themeProviderClassName = useMemo(() => {
      if (global) {
        return className;
      }
      const themeForClass = effectiveDefer && typeof window === "undefined" ? void 0 : resolvedTheme;
      const densityForClass = global ? void 0 : effectiveDensity;
      return themeProvider({
        className,
        density: densityForClass,
        theme: themeForClass
      });
    }, [className, effectiveDensity, effectiveDefer, resolvedTheme, global]);
    return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            asChild,
            className: themeProviderClassName,
            ...asChild ? {} : { "data-testid": ThemeProviderTestIds.ThemeProvider },
            ref,
            suppressHydrationWarning: effectiveDefer
          },
          props
        )
      }
    ) });
  }
);
ThemeProvider.displayName = "ThemeProvider";

export { ThemeProvider };
