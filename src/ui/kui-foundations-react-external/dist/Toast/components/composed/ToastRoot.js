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
import { ToastTestIds } from '../../constants.js';

const toastRoot = cva("nv-toast-root", {
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
const ToastRoot = forwardRef(
  ({ className, status = "info", ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: toastRoot({ className, status }),
            ref,
            "data-testid": ToastTestIds.ToastRoot
          },
          props
        )
      }
    );
  }
);
ToastRoot.displayName = "ToastRoot";

export { ToastRoot };
