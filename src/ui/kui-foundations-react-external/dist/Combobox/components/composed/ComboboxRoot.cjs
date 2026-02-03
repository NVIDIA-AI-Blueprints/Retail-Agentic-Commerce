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
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const INITIAL_SELECTED_VALUES = [];
function ComboboxRoot({
  children,
  defaultOpen,
  defaultSelectedValue,
  defaultValue,
  disabled = false,
  multiple = false,
  onOpenChange,
  onSelectedValueChange,
  onValueChange,
  open,
  readOnly = false,
  selectedValue,
  side,
  size = "medium",
  value,
  withCustomValueRendering = false
}) {
  const [selectedInputValue, setSelectedInputValue] = React__default.default.useState("");
  const contextValue = React__default.default.useMemo(
    () => ({
      selectedInputValue,
      setSelectedInputValue,
      size,
      readOnly,
      disabled
    }),
    [size, readOnly, disabled, selectedInputValue, setSelectedInputValue]
  );
  const internalDefaultSelectedValue = multiple ? INITIAL_SELECTED_VALUES : "";
  const internalDefaultValue = !multiple && !withCustomValueRendering && defaultSelectedValue ? defaultSelectedValue : defaultValue;
  return /* @__PURE__ */ jsxRuntime.jsx(context.ComboboxContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntime.jsx(
    react.ComboboxProvider,
    {
      resetValueOnHide: multiple || withCustomValueRendering,
      placement: side,
      defaultOpen,
      setOpen: onOpenChange,
      open: readOnly || disabled ? false : open,
      defaultSelectedValue: defaultSelectedValue ?? internalDefaultSelectedValue,
      setSelectedValue: onSelectedValueChange,
      selectedValue,
      defaultValue: defaultValue ?? internalDefaultValue,
      setValue: onValueChange,
      value,
      children
    }
  ) });
}
ComboboxRoot.displayName = "ComboboxRoot";

exports.ComboboxRoot = ComboboxRoot;
