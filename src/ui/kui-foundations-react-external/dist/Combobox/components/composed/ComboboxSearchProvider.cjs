/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var react = require('@ariakit/react');
var Menu = require('../../../Menu/index.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

function ComboboxSearchProvider({
  children,
  matchFn
}) {
  const comboboxStore = react.useComboboxContext();
  if (!comboboxStore) {
    throw new Error("ComboboxSearchProvider must be used within a Combobox");
  }
  const deferredValue = React__default.default.useDeferredValue(
    react.useStoreState(comboboxStore, "value")
  );
  const valueCtx = React__default.default.useMemo(
    () => ({ matchFn: matchFn ?? Menu.DEFAULT_MATCH_FN, value: deferredValue }),
    [matchFn, deferredValue]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(Menu.MenuSearchValueContext.Provider, { value: valueCtx, children });
}

exports.ComboboxSearchProvider = ComboboxSearchProvider;
