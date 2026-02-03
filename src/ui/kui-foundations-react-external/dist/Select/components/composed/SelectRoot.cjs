/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var react = require('@ariakit/react');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const SelectContext = React__default.default.createContext({});
function useSelectContext() {
  const context = React__default.default.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContext must be used within a SelectRoot");
  }
  return context;
}
const INITIAL_SELECTED_VALUES = [];
function SelectRoot({
  children,
  defaultOpen,
  defaultValue: _defaultValue,
  disabled,
  multiple,
  onOpenChange,
  onValueChange,
  open,
  readOnly,
  side,
  size = "medium",
  value
}) {
  const defaultValue = React__default.default.useMemo(() => {
    if (_defaultValue !== void 0) return _defaultValue;
    return multiple ? [] : "";
  }, [_defaultValue, multiple]);
  const internalDefaultSelectedValue = multiple ? INITIAL_SELECTED_VALUES : "";
  const contextValue = React__default.default.useMemo(
    () => ({ size, disabled, readOnly }),
    [size, disabled, readOnly]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(SelectContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntime.jsx(
    react.SelectProvider,
    {
      defaultOpen,
      defaultValue: defaultValue ?? internalDefaultSelectedValue,
      open: readOnly || disabled ? false : open,
      placement: side,
      setOpen: onOpenChange,
      setValue: onValueChange,
      value,
      children
    }
  ) });
}
SelectRoot.displayName = "SelectRoot";

exports.SelectContext = SelectContext;
exports.SelectRoot = SelectRoot;
exports.useSelectContext = useSelectContext;
