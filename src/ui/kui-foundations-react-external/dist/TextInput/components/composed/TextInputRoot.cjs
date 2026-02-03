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

const textInputRoot = classVarianceAuthority.cva("nv-text-input-root");
const TextInputRoot = react.forwardRef(
  ({
    size,
    status,
    kind = "flat",
    disabled,
    className,
    readOnly,
    value,
    dismissible,
    defaultValue = "",
    onValueChange,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useControllableState__default.default({
      value,
      defaultValue,
      onChange: onValueChange
    });
    const handleDismiss = react.useCallback(() => {
      setInternalValue("");
    }, [setInternalValue]);
    return /* @__PURE__ */ jsxRuntime.jsx(
      context.TextInputContext.Provider,
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
                ref,
                value: internalValue,
                disabled,
                readOnly,
                size,
                status,
                kind,
                dismissible,
                onDismiss: handleDismiss,
                className: textInputRoot({ className }),
                "data-testid": constants.TextInputTestIds.TextInputRoot
              },
              props
            )
          }
        )
      }
    );
  }
);
TextInputRoot.displayName = "TextInputRoot";

exports.TextInputRoot = TextInputRoot;
