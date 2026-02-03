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
import { DividerTestIds } from '../../constants.js';

const dividerElement = cva("nv-divider-element", {
  variants: {
    orientation: {
      horizontal: "nv-divider-element--orientation-horizontal",
      vertical: "nv-divider-element--orientation-vertical"
    },
    width: {
      small: "",
      medium: "nv-divider-element--width-medium",
      large: "nv-divider-element--width-large"
    }
  },
  defaultVariants: {
    orientation: "horizontal",
    width: "small"
  }
});
const DividerElement = forwardRef(
  ({ className, orientation, width, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: dividerElement({ className, orientation, width }),
            ref,
            "data-testid": DividerTestIds.DividerElement,
            role: "separator",
            "aria-orientation": orientation
          },
          props
        )
      }
    );
  }
);
DividerElement.displayName = "DividerElement";

export { DividerElement };
