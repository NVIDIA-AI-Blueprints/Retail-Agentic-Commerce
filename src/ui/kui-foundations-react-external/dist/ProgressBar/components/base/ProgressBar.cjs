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
var RadixProgress = require('@radix-ui/react-progress');
var classVarianceAuthority = require('class-variance-authority');
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

var RadixProgress__namespace = /*#__PURE__*/_interopNamespace(RadixProgress);

const progressBar = classVarianceAuthority.cva("nv-progress-bar", {
  variants: {
    kind: {
      determinate: "",
      indeterminate: "nv-progress-bar--indeterminate"
    },
    size: {
      small: "nv-progress-bar--size-small",
      medium: "",
      large: "nv-progress-bar--size-large"
    }
  }
});
const ProgressBar = react.forwardRef(
  ({ className, value, kind, size, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(RadixProgress__namespace.Root, { asChild: true, value, children: /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ...mergeProps.mergeProps(
          {
            className: progressBar({ className, kind, size }),
            "data-testid": constants.ProgressBarTestIds.Track,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(
          RadixProgress__namespace.Indicator,
          {
            className: "nv-progress-bar-indicator",
            "data-testid": constants.ProgressBarTestIds.Indicator,
            style: { width: `${value}%` }
          }
        )
      }
    ) });
  }
);
ProgressBar.displayName = "ProgressBar";

exports.ProgressBar = ProgressBar;
