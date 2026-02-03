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
var RadioGroupPrimitives = require('@radix-ui/react-radio-group');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var RadioGroupPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadioGroupPrimitives);

const radioGroupRoot = classVarianceAuthority.cva("nv-radio-group-root", {
  variants: {
    error: {
      true: "nv-radio-group-root--error"
    },
    orientation: {
      vertical: "",
      horizontal: "nv-radio-group-root--orientation-horizontal"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});
const RadioGroupRoot = react.forwardRef(
  ({
    className,
    defaultValue,
    value,
    onValueChange,
    disabled,
    required,
    error,
    name,
    orientation,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadioGroupPrimitives__namespace.RadioGroup,
      {
        defaultValue,
        value,
        onValueChange,
        disabled,
        name,
        orientation,
        required,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          primitive.Primitive.div,
          {
            ...mergeProps.mergeProps(
              {
                className: radioGroupRoot({ className, error, orientation }),
                ref,
                "data-testid": constants.RadioGroupTestIds.RadioGroupRoot
              },
              props
            )
          }
        )
      }
    );
  }
);
RadioGroupRoot.displayName = "RadioGroupRoot";

exports.RadioGroupRoot = RadioGroupRoot;
