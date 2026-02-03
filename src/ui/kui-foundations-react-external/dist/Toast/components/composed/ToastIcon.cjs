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
var Icon = require('../../../lib/components/Icon.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const toastIcon = classVarianceAuthority.cva("nv-toast-icon");
const iconNameMap = {
  info: "info-circle",
  success: "check-circle",
  warning: "warning",
  error: "error",
  neutral: "bell",
  working: "circle-tick"
};
const ToastIcon = react.forwardRef(
  ({ className, status, ...props }, ref) => {
    const iconName = iconNameMap[status || "info"];
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ...mergeProps.mergeProps(
          {
            className: toastIcon({ className }),
            ref,
            "data-testid": constants.ToastTestIds.ToastIcon
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: iconName, variant: "fill" })
      }
    );
  }
);
ToastIcon.displayName = "ToastIcon";

exports.ToastIcon = ToastIcon;
