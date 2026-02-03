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
var RadixCheckbox = require('@radix-ui/react-checkbox');
var classVarianceAuthority = require('class-variance-authority');
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
var RadixCheckbox__namespace = /*#__PURE__*/_interopNamespace(RadixCheckbox);

const checkboxIndicator = classVarianceAuthority.cva("nv-checkbox-indicator", {
  variants: {
    error: {
      true: "nv-checkbox-indicator--error"
    }
  }
});
const CheckboxIndicator = React__default.default.forwardRef(({ className, checked, error, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(RadixCheckbox__namespace.Indicator, { forceMount: true, asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      ...mergeProps.mergeProps(
        {
          ref,
          "data-testid": constants.CheckboxTestIds.Indicator,
          className: checkboxIndicator({ className, error })
        },
        props
      ),
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 18 18",
      fill: "none",
      children: checked === "indeterminate" ? /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 8L12 8", stroke: "currentColor", strokeWidth: "2" }) : /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "M3 8L6.18198 11.182L13.253 4.11091",
          stroke: "currentColor",
          strokeWidth: "2"
        }
      )
    }
  ) });
});
CheckboxIndicator.displayName = "CheckboxIndicator";

exports.CheckboxIndicator = CheckboxIndicator;
exports.checkboxIndicator = checkboxIndicator;
