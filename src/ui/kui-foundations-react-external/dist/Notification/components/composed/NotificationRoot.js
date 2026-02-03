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
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { NotificationTestIds } from '../../constants.js';

const notificationRoot = cva("nv-notification-root", {
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
const NotificationRoot = forwardRef(({ className, status, kind, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: notificationRoot({ className, status, kind }),
          ref,
          "data-testid": NotificationTestIds.NotificationRoot
        },
        props
      )
    }
  );
});
NotificationRoot.displayName = "NotificationRoot";

export { NotificationRoot };
