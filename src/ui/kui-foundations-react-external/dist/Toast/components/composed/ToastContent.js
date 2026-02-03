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

const toastContent = cva("nv-toast-content");
const ToastContent = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: toastContent({ className }),
            ref,
            "data-testid": ToastTestIds.ToastContent
          },
          props
        )
      }
    );
  }
);
ToastContent.displayName = "ToastContent";

export { ToastContent };
