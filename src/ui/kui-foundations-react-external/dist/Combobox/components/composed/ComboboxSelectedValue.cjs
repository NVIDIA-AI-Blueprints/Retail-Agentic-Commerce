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
var Tag = require('../../../Tag/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const ComboboxSelectedValue = React__default.default.forwardRef(({ className, children, onDismiss, ...props }, ref) => {
  const { readOnly, disabled } = context.useComboboxContext();
  const comboboxContext = react.useComboboxContext();
  if (!comboboxContext) {
    throw new Error(
      "ComboboxSelectedValue must be used within a ComboboxProvider"
    );
  }
  const selectedValue = react.useStoreState(comboboxContext, "selectedValue");
  const handleDismiss = React__default.default.useCallback(() => {
    comboboxContext.setSelectedValue((prev) => Array.isArray(prev) ? [] : "");
    comboboxContext.move(null);
    onDismiss?.();
  }, [comboboxContext, onDismiss]);
  if (children) {
    return children({
      selectedValue,
      setSelectedValue: comboboxContext.setSelectedValue
    });
  }
  const isMulti = Array.isArray(selectedValue);
  if (!isMulti || selectedValue.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Tag.Tag,
    {
      className: classVarianceAuthority.cx("nv-density-compact", className),
      disabled,
      readOnly,
      color: "gray",
      onClick: !(readOnly || disabled) ? handleDismiss : void 0,
      ref,
      ...props,
      children: [
        `${selectedValue.length} selected`,
        /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close", variant: "fill" })
      ]
    }
  );
});
ComboboxSelectedValue.displayName = "ComboboxSelectedValue";

exports.ComboboxSelectedValue = ComboboxSelectedValue;
