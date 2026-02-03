/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var hooks = require('../../hooks.cjs');
var types = require('../../types.cjs');
var utils = require('../../utils.cjs');

const themeProvider = classVarianceAuthority.cva(null, {
  variants: {
    density: {
      spacious: types.DENSITY_CLASS_NAMES.spacious,
      compact: types.DENSITY_CLASS_NAMES.compact,
      standard: types.DENSITY_CLASS_NAMES.standard
    },
    theme: {
      light: types.THEME_CLASS_NAMES.light,
      dark: types.THEME_CLASS_NAMES.dark,
      default: ""
    }
  },
  defaultVariants: {
    density: "standard",
    theme: "default"
  }
});
const ThemeProvider = react.forwardRef(
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
    const parentContext = context.useParentThemeContext();
    const {
      density: effectiveDensity,
      defer: effectiveDefer,
      resolvedTheme,
      unresolvedTheme,
      updateTheme,
      updateDensity
    } = hooks.useThemeManager({
      global,
      target,
      initialTheme: theme,
      initialDensity: density,
      parentContext,
      defer
    });
    const contextValue = react.useMemo(
      () => ({
        density: effectiveDensity,
        unresolvedTheme,
        theme: resolvedTheme ?? utils.detectSystemThemePreference(),
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
    const themeProviderClassName = react.useMemo(() => {
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
    return /* @__PURE__ */ jsxRuntime.jsx(context.ThemeContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            asChild,
            className: themeProviderClassName,
            ...asChild ? {} : { "data-testid": constants.ThemeProviderTestIds.ThemeProvider },
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

exports.ThemeProvider = ThemeProvider;
