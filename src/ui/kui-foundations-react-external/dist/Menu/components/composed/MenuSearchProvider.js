/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { childrenToText } from '../../../lib/utils/children.js';
import { includesValue } from '../../../lib/utils/string-compare.js';

const MenuSearchHandlersContext = React.createContext(void 0);
const MenuSearchValueContext = React.createContext(void 0);
function useMenuSearchHandlers() {
  return React.useContext(MenuSearchHandlersContext);
}
function useMenuSearchIsMatch(filterValue, value, children) {
  const ctx = React.useContext(MenuSearchValueContext);
  const str = filterValue ?? (childrenToText(children).trim() || null) ?? value;
  if (filterValue === null || !ctx || !ctx.value || typeof str !== "string" || ctx.matchFn === "disable") {
    return void 0;
  }
  return ctx.matchFn(ctx.value, str);
}
const DEFAULT_MATCH_FN = (matchTerm, value) => {
  if (!matchTerm) return true;
  return includesValue(matchTerm, value);
};
function MenuSearchProvider({
  children,
  defaultValue = "",
  matchFn,
  onValueChange,
  value
}) {
  const [internalValue, setInternalValue] = useControllableState({
    defaultValue,
    value,
    onChange: onValueChange
  });
  const deferredValue = React.useDeferredValue(internalValue);
  const valueCtx = React.useMemo(
    () => ({ matchFn: matchFn ?? DEFAULT_MATCH_FN, value: deferredValue }),
    [matchFn, deferredValue]
  );
  return /* @__PURE__ */ jsx(
    MenuSearchHandlersContext.Provider,
    {
      value: React.useMemo(
        () => ({ setValue: setInternalValue }),
        [setInternalValue]
      ),
      children: /* @__PURE__ */ jsx(MenuSearchValueContext.Provider, { value: valueCtx, children })
    }
  );
}

export { DEFAULT_MATCH_FN, MenuSearchHandlersContext, MenuSearchProvider, MenuSearchValueContext, useMenuSearchHandlers, useMenuSearchIsMatch };
