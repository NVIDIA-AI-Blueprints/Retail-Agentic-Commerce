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

const toastActions = cva("nv-toast-actions");
const ToastActions = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: toastActions({ className }),
            ref,
            "data-testid": ToastTestIds.ToastActions
          },
          props
        )
      }
    );
  }
);
ToastActions.displayName = "ToastActions";

export { ToastActions };
