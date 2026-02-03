/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var children = require('../../../lib/utils/children.cjs');
var stringCompare = require('../../../lib/utils/string-compare.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);
var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const MenuSearchHandlersContext = React__default.default.createContext(void 0);
const MenuSearchValueContext = React__default.default.createContext(void 0);
function useMenuSearchHandlers() {
  return React__default.default.useContext(MenuSearchHandlersContext);
}
function useMenuSearchIsMatch(filterValue, value, children$1) {
  const ctx = React__default.default.useContext(MenuSearchValueContext);
  const str = filterValue ?? (children.childrenToText(children$1).trim() || null) ?? value;
  if (filterValue === null || !ctx || !ctx.value || typeof str !== "string" || ctx.matchFn === "disable") {
    return void 0;
  }
  return ctx.matchFn(ctx.value, str);
}
const DEFAULT_MATCH_FN = (matchTerm, value) => {
  if (!matchTerm) return true;
  return stringCompare.includesValue(matchTerm, value);
};
function MenuSearchProvider({
  children,
  defaultValue = "",
  matchFn,
  onValueChange,
  value
}) {
  const [internalValue, setInternalValue] = useControllableState__default.default({
    defaultValue,
    value,
    onChange: onValueChange
  });
  const deferredValue = React__default.default.useDeferredValue(internalValue);
  const valueCtx = React__default.default.useMemo(
    () => ({ matchFn: matchFn ?? DEFAULT_MATCH_FN, value: deferredValue }),
    [matchFn, deferredValue]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    MenuSearchHandlersContext.Provider,
    {
      value: React__default.default.useMemo(
        () => ({ setValue: setInternalValue }),
        [setInternalValue]
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx(MenuSearchValueContext.Provider, { value: valueCtx, children })
    }
  );
}

exports.DEFAULT_MATCH_FN = DEFAULT_MATCH_FN;
exports.MenuSearchHandlersContext = MenuSearchHandlersContext;
exports.MenuSearchProvider = MenuSearchProvider;
exports.MenuSearchValueContext = MenuSearchValueContext;
exports.useMenuSearchHandlers = useMenuSearchHandlers;
exports.useMenuSearchIsMatch = useMenuSearchIsMatch;
