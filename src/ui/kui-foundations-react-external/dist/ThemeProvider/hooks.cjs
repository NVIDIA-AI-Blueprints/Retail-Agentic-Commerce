/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');
var context = require('./context.cjs');
var types = require('./types.cjs');
var utils = require('./utils.cjs');

const useThemeManager = ({
  global,
  target,
  initialTheme,
  initialDensity,
  parentContext,
  defer
}) => {
  const [localTheme, setLocalTheme] = react.useState(void 0);
  const [localDensity, setLocalDensity] = react.useState(
    void 0
  );
  const [resolvedTheme, setResolvedTheme] = react.useState(
    null
  );
  const [systemThemeCleanup, setSystemThemeCleanup] = react.useState(null);
  const [initializedFromDOM, setInitializedFromDOM] = react.useState(false);
  const effectiveValues = react.useMemo(() => {
    const effectiveDensity = localDensity ?? initialDensity ?? parentContext?.density ?? "standard";
    const effectiveTheme = localTheme ?? initialTheme ?? parentContext?.unresolvedTheme;
    const effectiveDefer = defer ?? parentContext?.defer ?? false;
    return {
      density: effectiveDensity,
      theme: effectiveTheme,
      defer: effectiveDefer
    };
  }, [
    localDensity,
    initialDensity,
    parentContext?.density,
    localTheme,
    initialTheme,
    parentContext?.unresolvedTheme,
    defer,
    parentContext?.defer
  ]);
  react.useEffect(() => {
    if (effectiveValues.theme) {
      setResolvedTheme(utils.resolveTheme(effectiveValues.theme));
    } else if (global && typeof window !== "undefined") {
      setResolvedTheme(utils.detectSystemThemePreference());
    } else {
      setResolvedTheme(null);
    }
  }, [effectiveValues.theme, global]);
  const prevInitialDensity = react.useRef(initialDensity);
  const prevInitialTheme = react.useRef(initialTheme);
  react.useEffect(() => {
    if (initialDensity !== prevInitialDensity.current && initialDensity !== void 0) {
      setLocalDensity(void 0);
      prevInitialDensity.current = initialDensity;
    }
  }, [initialDensity]);
  react.useEffect(() => {
    if (initialTheme !== prevInitialTheme.current && initialTheme !== void 0) {
      setLocalTheme(void 0);
      prevInitialTheme.current = initialTheme;
    }
  }, [initialTheme]);
  const getTargetElement = react.useCallback(() => {
    return target === "html" ? document.documentElement : document.body;
  }, [target]);
  const setDensityOnElement = react.useCallback(
    (element, newDensity) => {
      const densityClasses = Object.values(types.DENSITY_CLASS_NAMES);
      element.classList.remove(...densityClasses);
      element.classList.add(types.DENSITY_CLASS_NAMES[newDensity]);
    },
    []
  );
  const setThemeOnElement = react.useCallback(
    (element, theme) => {
      const themeClasses = Object.values(types.THEME_CLASS_NAMES);
      element.classList.remove(...themeClasses);
      element.classList.add(types.THEME_CLASS_NAMES[theme]);
      if (element instanceof HTMLElement) {
        element.style.colorScheme = theme;
      }
    },
    []
  );
  const getDensityFromElement = react.useCallback(
    (element) => {
      for (const [key, className] of Object.entries(types.DENSITY_CLASS_NAMES)) {
        if (element.classList.contains(className)) {
          return key;
        }
      }
      return void 0;
    },
    []
  );
  const getThemeFromElement = react.useCallback(
    (element) => {
      if (element.classList.contains(types.THEME_CLASS_NAMES.dark)) {
        return "dark";
      }
      if (element.classList.contains(types.THEME_CLASS_NAMES.light)) {
        return "light";
      }
      return void 0;
    },
    []
  );
  const updateTheme = react.useCallback(
    (newTheme) => {
      setLocalTheme(newTheme);
      const newResolvedTheme = utils.resolveTheme(newTheme);
      setResolvedTheme(newResolvedTheme);
      if (global && typeof window !== "undefined") {
        const element = getTargetElement();
        setThemeOnElement(element, newResolvedTheme);
        if (systemThemeCleanup) {
          systemThemeCleanup();
          setSystemThemeCleanup(null);
        }
        if (newTheme === "system") {
          const cleanup = utils.createSystemThemeListener(() => {
            const systemTheme = utils.detectSystemThemePreference();
            setThemeOnElement(element, systemTheme);
            setResolvedTheme(systemTheme);
          });
          setSystemThemeCleanup(() => cleanup);
        }
      }
    },
    [global, getTargetElement, setThemeOnElement, systemThemeCleanup]
  );
  const updateDensity = react.useCallback(
    (newDensity) => {
      setLocalDensity(newDensity);
      if (global && typeof window !== "undefined") {
        const element = getTargetElement();
        setDensityOnElement(element, newDensity);
      }
    },
    [global, getTargetElement, setDensityOnElement]
  );
  react.useEffect(() => {
    if (!global || typeof window === "undefined") return;
    const element = getTargetElement();
    if (!initializedFromDOM) {
      const existingDensity = getDensityFromElement(element);
      const existingTheme = getThemeFromElement(element);
      if (!initialDensity && !localDensity && existingDensity) {
        setLocalDensity(existingDensity);
      }
      if (!initialTheme && !localTheme && existingTheme) {
        setLocalTheme(existingTheme);
        setResolvedTheme(existingTheme);
      }
      setDensityOnElement(element, effectiveValues.density);
      if (effectiveValues.theme) {
        const themeToApply = utils.resolveTheme(effectiveValues.theme);
        setThemeOnElement(element, themeToApply);
      } else if (resolvedTheme) {
        setThemeOnElement(element, resolvedTheme);
      }
      setInitializedFromDOM(true);
    }
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const newDensity = getDensityFromElement(element);
          const newTheme = getThemeFromElement(element);
          if (newDensity !== effectiveValues.density && !localDensity && !initialDensity) {
            setLocalDensity(newDensity);
          }
          if (newTheme !== resolvedTheme && !localTheme && !initialTheme) {
            setResolvedTheme(newTheme ?? null);
          }
        }
      }
    });
    mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [
    global,
    effectiveValues.density,
    resolvedTheme,
    initializedFromDOM,
    localDensity,
    localTheme,
    initialDensity,
    initialTheme,
    getTargetElement,
    getDensityFromElement,
    getThemeFromElement,
    setDensityOnElement,
    setThemeOnElement
  ]);
  react.useEffect(() => {
    if (global || effectiveValues.theme !== "system") {
      return;
    }
    return utils.createSystemThemeListener(() => {
      setResolvedTheme(utils.detectSystemThemePreference());
    });
  }, [effectiveValues.theme, global]);
  react.useEffect(() => {
    return () => {
      if (systemThemeCleanup) {
        systemThemeCleanup();
      }
    };
  }, [systemThemeCleanup]);
  return {
    density: effectiveValues.density,
    resolvedTheme,
    unresolvedTheme: effectiveValues.theme,
    defer: effectiveValues.defer,
    updateTheme,
    updateDensity
  };
};
const useTheme = () => {
  return context.useThemeContext();
};

exports.useTheme = useTheme;
exports.useThemeManager = useThemeManager;
