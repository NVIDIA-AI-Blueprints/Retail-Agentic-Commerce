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
var PolymorphicInput = require('../../../lib/components/PolymorphicInput.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const textAreaRoot = classVarianceAuthority.cva("nv-text-area-root");
const TextAreaRoot = react.forwardRef(
  ({
    size,
    status,
    disabled,
    readOnly,
    value,
    defaultValue = "",
    onValueChange,
    className,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useControllableState__default.default({
      value,
      defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsxRuntime.jsx(
      context.TextAreaContext.Provider,
      {
        value: {
          disabled,
          readOnly,
          value: internalValue,
          onValueChange: setInternalValue
        },
        children: /* @__PURE__ */ jsxRuntime.jsx(
          PolymorphicInput.PolymorphicInput,
          {
            ...mergeProps.mergeProps(
              {
                className: textAreaRoot({ className }),
                "data-testid": constants.TextAreaTestIds.TextAreaRoot,
                value: internalValue,
                ref,
                disabled: disabled || readOnly,
                readOnly,
                size,
                status,
                kind: "flat"
              },
              props
            )
          }
        )
      }
    );
  }
);
TextAreaRoot.displayName = "TextAreaRoot";

exports.TextAreaRoot = TextAreaRoot;
