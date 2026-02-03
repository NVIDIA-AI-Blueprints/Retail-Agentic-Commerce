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
import { SwitchTestIds } from '../../constants.js';

const switchRoot = cva("nv-switch-root", {
  variants: {
    side: {
      left: "nv-switch-root--side-left",
      right: ""
      // default
    },
    size: {
      small: "nv-switch-root--size-small",
      medium: "",
      large: "nv-switch-root--size-large"
    }
  },
  defaultVariants: {
    side: "right",
    size: "medium"
  }
});
const SwitchRoot = forwardRef(
  ({ className, side, size, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: switchRoot({ className, side, size }),
            ref,
            "data-testid": SwitchTestIds.Root
          },
          props
        )
      }
    );
  }
);
SwitchRoot.displayName = "SwitchRoot";

export { SwitchRoot };
