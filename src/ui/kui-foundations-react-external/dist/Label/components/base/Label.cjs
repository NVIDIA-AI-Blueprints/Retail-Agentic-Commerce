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
var RadixLabel = require('@radix-ui/react-label');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

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

var React__default = /*#__PURE__*/_interopDefault(React);
var RadixLabel__namespace = /*#__PURE__*/_interopNamespace(RadixLabel);

const label = classVarianceAuthority.cva("nv-label", {
  variants: {
    disabled: {
      true: "nv-label--disabled"
    },
    size: {
      small: "nv-label--size-small",
      medium: "nv-label--size-standard",
      large: "nv-label--size-large"
    }
  },
  defaultVariants: {
    size: "medium"
  }
});
const Label = React__default.default.forwardRef(
  ({ htmlFor, className, disabled, size, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(RadixLabel__namespace.Root, { htmlFor, asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.label,
      {
        ...mergeProps.mergeProps(
          {
            className: label({ className, disabled, size }),
            "data-testid": constants.LabelTestId.Label,
            ref
          },
          props
        )
      }
    ) });
  }
);
Label.displayName = "Label";

exports.Label = Label;
