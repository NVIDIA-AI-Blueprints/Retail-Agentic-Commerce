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

const notificationRoot = classVarianceAuthority.cva("nv-notification-root", {
  variants: {
    kind: {
      stacked: "",
      inline: "nv-notification-root--kind-inline"
    },
    status: {
      info: "",
      // Default value
      warning: "nv-notification-root--status-warning",
      error: "nv-notification-root--status-error",
      success: "nv-notification-root--status-success"
    }
  },
  defaultVariants: {
    status: "info"
  }
});
const NotificationRoot = react.forwardRef(({ className, status, kind, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: notificationRoot({ className, status, kind }),
          ref,
          "data-testid": constants.NotificationTestIds.NotificationRoot
        },
        props
      )
    }
  );
});
NotificationRoot.displayName = "NotificationRoot";

exports.NotificationRoot = NotificationRoot;
