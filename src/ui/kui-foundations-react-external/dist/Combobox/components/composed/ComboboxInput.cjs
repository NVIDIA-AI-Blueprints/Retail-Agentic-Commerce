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
var classVarianceAuthority = require('class-variance-authority');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const ComboboxInput = React__default.default.forwardRef(
  ({ className, onBlur, placeholder, resetValueOnBlur = true, ...props }, ref) => {
    const { disabled, readOnly, selectedInputValue } = context.useComboboxContext();
    const comboboxContext = react.useComboboxContext();
    const selectedValue = react.useStoreState(comboboxContext, "selectedValue");
    const inputValue = react.useStoreState(comboboxContext, "value");
    const isMulti = Array.isArray(selectedValue);
    const hasValue = isMulti ? selectedValue.length > 0 : selectedValue;
    const defaultPlaceholder = isMulti ? "Select item(s)" : "Select item";
    const displayValue = isMulti ? selectedValue.join(", ") : selectedValue;
    const handleOnBlur = React__default.default.useCallback(
      (e) => {
        if (resetValueOnBlur && !isMulti && selectedInputValue && inputValue !== selectedInputValue) {
          comboboxContext?.setValue(selectedInputValue);
        }
        onBlur?.(e);
      },
      [
        onBlur,
        selectedInputValue,
        inputValue,
        comboboxContext,
        resetValueOnBlur,
        isMulti
      ]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      react.Combobox,
      {
        "aria-label": typeof displayValue === "string" ? displayValue : defaultPlaceholder,
        onBlur: handleOnBlur,
        className: classVarianceAuthority.cx("nv-combobox-input", className),
        disabled: disabled || readOnly,
        placeholder: hasValue ? "" : placeholder ?? defaultPlaceholder,
        ref,
        ...props
      }
    );
  }
);
ComboboxInput.displayName = "ComboboxInput";

exports.ComboboxInput = ComboboxInput;
