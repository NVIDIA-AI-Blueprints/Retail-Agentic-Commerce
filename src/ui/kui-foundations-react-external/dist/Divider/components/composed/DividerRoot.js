/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva, cx } from 'class-variance-authority';
import { Primitive, primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DividerTestIds } from '../../constants.js';

const dividerRoot = cva("nv-divider-root", {
  variants: {
    orientation: {
      horizontal: "nv-divider-root--orientation-horizontal",
      vertical: "nv-divider-root--orientation-vertical"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});
const DividerRoot = forwardRef(
  ({
    className,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    orientation,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: cx(
              dividerRoot({ className, orientation }),
              primitive({
                padding,
                paddingX,
                paddingY,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                spacingX,
                spacingY,
                spacingTop,
                spacingRight,
                spacingBottom,
                spacingLeft
              })
            ),
            ref,
            "data-testid": DividerTestIds.DividerRoot
          },
          props
        )
      }
    );
  }
);
DividerRoot.displayName = "DividerRoot";

export { DividerRoot };
