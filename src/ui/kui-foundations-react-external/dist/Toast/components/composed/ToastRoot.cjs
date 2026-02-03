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

const toastRoot = classVarianceAuthority.cva("nv-toast-root", {
  variants: {
    status: {
      info: "nv-toast-root--status-info",
      success: "nv-toast-root--status-success",
      warning: "nv-toast-root--status-warning",
      error: "nv-toast-root--status-error",
      neutral: "nv-toast-root--status-neutral",
      working: "nv-toast-root--status-working"
    }
  },
  defaultVariants: {
    status: "info"
  }
});
const ToastRoot = react.forwardRef(
  ({ className, status = "info", ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: toastRoot({ className, status }),
            ref,
            "data-testid": constants.ToastTestIds.ToastRoot
          },
          props
        )
      }
    );
  }
);
ToastRoot.displayName = "ToastRoot";

exports.ToastRoot = ToastRoot;
