/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Icon } from '../../../lib/components/Icon.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { NotificationTestIds } from '../../constants.js';

const notificationIcon = cva("nv-notification-icon");
const notificationIconNameMap = {
  success: "check-circle",
  error: "error",
  warning: "warning",
  info: "info-circle"
};
const NotificationIcon = forwardRef(({ className, status, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: notificationIcon({ className }),
          ref,
          "data-testid": NotificationTestIds.NotificationIcon
        },
        props
      ),
      children: props.children || /* @__PURE__ */ jsx(Icon, { name: notificationIconNameMap[status || "info"], variant: "fill" })
    }
  );
});
NotificationIcon.displayName = "NotificationIcon";

export { NotificationIcon };
