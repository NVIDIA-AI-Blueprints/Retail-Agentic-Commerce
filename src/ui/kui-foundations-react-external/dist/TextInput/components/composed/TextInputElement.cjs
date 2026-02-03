/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const textInputElement = classVarianceAuthority.cva("nv-text-input-element");
const TextInputElement = react.forwardRef(({ className, onChange, type = "text", ...props }, ref) => {
  const context$1 = context.useTextInputContext();
  const handleChange = react.useCallback(
    (e) => {
      onChange?.(e);
      if (!e.defaultPrevented) {
        context$1.onValueChange?.(e.target.value);
      }
    },
    [onChange, context$1]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.input,
    {
      ...mergeProps.mergeProps(
        {
          className: textInputElement({ className }),
          ref,
          value: context$1.value,
          disabled: context$1.disabled || context$1.readOnly,
          readOnly: context$1.readOnly,
          "data-testid": constants.TextInputTestIds.TextInputElement
        },
        props
      ),
      type,
      onChange: handleChange
    }
  );
});
TextInputElement.displayName = "TextInputElement";

exports.TextInputElement = TextInputElement;
