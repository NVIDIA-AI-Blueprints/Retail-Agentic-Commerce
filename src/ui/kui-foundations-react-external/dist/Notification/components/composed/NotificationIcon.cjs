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
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const notificationIcon = classVarianceAuthority.cva("nv-notification-icon");
const notificationIconNameMap = {
  success: "check-circle",
  error: "error",
  warning: "warning",
  info: "info-circle"
};
const NotificationIcon = react.forwardRef(({ className, status, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: notificationIcon({ className }),
          ref,
          "data-testid": constants.NotificationTestIds.NotificationIcon
        },
        props
      ),
      children: props.children || /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: notificationIconNameMap[status || "info"], variant: "fill" })
    }
  );
});
NotificationIcon.displayName = "NotificationIcon";

exports.NotificationIcon = NotificationIcon;
