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
import { StatusMessageTestIds } from '../../constants.js';

const statusMessageRoot = cva("nv-status-message-root", {
  variants: {
    size: {
      small: "nv-status-message-root--size-small",
      medium: ""
    }
  },
  defaultVariants: {
    size: "medium"
  }
});
const StatusMessageRoot = forwardRef(({ className, size, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: statusMessageRoot({ className, size }),
          ref,
          "data-testid": StatusMessageTestIds.StatusMessageRoot
        },
        props
      )
    }
  );
});
StatusMessageRoot.displayName = "StatusMessageRoot";

export { StatusMessageRoot };
