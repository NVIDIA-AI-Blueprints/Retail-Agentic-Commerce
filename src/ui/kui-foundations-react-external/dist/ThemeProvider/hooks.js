/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useThemeContext } from './context.js';
import { DENSITY_CLASS_NAMES, THEME_CLASS_NAMES } from './types.js';
import { resolveTheme, detectSystemThemePreference, createSystemThemeListener } from './utils.js';

const useThemeManager = ({
  global,
  target,
  initialTheme,
  initialDensity,
  parentContext,
  defer
}) => {
  const [localTheme, setLocalTheme] = useState(void 0);
  const [localDensity, setLocalDensity] = useState(
    void 0
  );
  const [resolvedTheme, setResolvedTheme] = useState(
    null
  );
  const [systemThemeCleanup, setSystemThemeCleanup] = useState(null);
  const [initializedFromDOM, setInitializedFromDOM] = useState(false);
  const effectiveValues = useMemo(() => {
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
  useEffect(() => {
    if (effectiveValues.theme) {
      setResolvedTheme(resolveTheme(effectiveValues.theme));
    } else if (global && typeof window !== "undefined") {
      setResolvedTheme(detectSystemThemePreference());
    } else {
      setResolvedTheme(null);
    }
  }, [effectiveValues.theme, global]);
  const prevInitialDensity = useRef(initialDensity);
  const prevInitialTheme = useRef(initialTheme);
  useEffect(() => {
    if (initialDensity !== prevInitialDensity.current && initialDensity !== void 0) {
      setLocalDensity(void 0);
      prevInitialDensity.current = initialDensity;
    }
  }, [initialDensity]);
  useEffect(() => {
    if (initialTheme !== prevInitialTheme.current && initialTheme !== void 0) {
      setLocalTheme(void 0);
      prevInitialTheme.current = initialTheme;
    }
  }, [initialTheme]);
  const getTargetElement = useCallback(() => {
    return target === "html" ? document.documentElement : document.body;
  }, [target]);
  const setDensityOnElement = useCallback(
    (element, newDensity) => {
      const densityClasses = Object.values(DENSITY_CLASS_NAMES);
      element.classList.remove(...densityClasses);
      element.classList.add(DENSITY_CLASS_NAMES[newDensity]);
    },
    []
  );
  const setThemeOnElement = useCallback(
    (element, theme) => {
      const themeClasses = Object.values(THEME_CLASS_NAMES);
      element.classList.remove(...themeClasses);
      element.classList.add(THEME_CLASS_NAMES[theme]);
      if (element instanceof HTMLElement) {
        element.style.colorScheme = theme;
      }
    },
    []
  );
  const getDensityFromElement = useCallback(
    (element) => {
      for (const [key, className] of Object.entries(DENSITY_CLASS_NAMES)) {
        if (element.classList.contains(className)) {
          return key;
        }
      }
      return void 0;
    },
    []
  );
  const getThemeFromElement = useCallback(
    (element) => {
      if (element.classList.contains(THEME_CLASS_NAMES.dark)) {
        return "dark";
      }
      if (element.classList.contains(THEME_CLASS_NAMES.light)) {
        return "light";
      }
      return void 0;
    },
    []
  );
  const updateTheme = useCallback(
    (newTheme) => {
      setLocalTheme(newTheme);
      const newResolvedTheme = resolveTheme(newTheme);
      setResolvedTheme(newResolvedTheme);
      if (global && typeof window !== "undefined") {
        const element = getTargetElement();
        setThemeOnElement(element, newResolvedTheme);
        if (systemThemeCleanup) {
          systemThemeCleanup();
          setSystemThemeCleanup(null);
        }
        if (newTheme === "system") {
          const cleanup = createSystemThemeListener(() => {
            const systemTheme = detectSystemThemePreference();
            setThemeOnElement(element, systemTheme);
            setResolvedTheme(systemTheme);
          });
          setSystemThemeCleanup(() => cleanup);
        }
      }
    },
    [global, getTargetElement, setThemeOnElement, systemThemeCleanup]
  );
  const updateDensity = useCallback(
    (newDensity) => {
      setLocalDensity(newDensity);
      if (global && typeof window !== "undefined") {
        const element = getTargetElement();
        setDensityOnElement(element, newDensity);
      }
    },
    [global, getTargetElement, setDensityOnElement]
  );
  useEffect(() => {
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
        const themeToApply = resolveTheme(effectiveValues.theme);
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
  useEffect(() => {
    if (global || effectiveValues.theme !== "system") {
      return;
    }
    return createSystemThemeListener(() => {
      setResolvedTheme(detectSystemThemePreference());
    });
  }, [effectiveValues.theme, global]);
  useEffect(() => {
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
  return useThemeContext();
};

export { useTheme, useThemeManager };
