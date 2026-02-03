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
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { ToastTestIds } from '../../constants.js';

const toastIcon = cva("nv-toast-icon");
const iconNameMap = {
  info: "info-circle",
  success: "check-circle",
  warning: "warning",
  error: "error",
  neutral: "bell",
  working: "circle-tick"
};
const ToastIcon = forwardRef(
  ({ className, status, ...props }, ref) => {
    const iconName = iconNameMap[status || "info"];
    return /* @__PURE__ */ jsx(
      "div",
      {
        ...mergeProps(
          {
            className: toastIcon({ className }),
            ref,
            "data-testid": ToastTestIds.ToastIcon
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Icon, { name: iconName, variant: "fill" })
      }
    );
  }
);
ToastIcon.displayName = "ToastIcon";

export { ToastIcon };
