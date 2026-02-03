/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva, cx } from 'class-variance-authority';
import { Primitive, primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { getResponsiveClassName } from '../../../lib/utils/responsive.js';
import { buildVariants } from '../../../lib/utils/variants.js';
import { GridTestIds } from '../../constants.js';

const grid = cva("nv-grid", {
  variants: {
    flow: buildVariants("nv-grid", "flow", [
      "row",
      "col",
      "dense",
      "row-dense",
      "col-dense"
    ])
  }
});
const Grid = React.forwardRef(
  ({
    className,
    cols,
    flow,
    gap,
    rows,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacing,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    ...divProps
  }, ref) => /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: cx(
            primitive({
              gap,
              padding,
              paddingX,
              paddingY,
              paddingTop,
              paddingRight,
              paddingBottom,
              paddingLeft,
              spacing,
              spacingX,
              spacingY,
              spacingTop,
              spacingRight,
              spacingBottom,
              spacingLeft
            }),
            grid({
              flow
            }),
            getResponsiveClassName("nv-grid", "cols", cols),
            getResponsiveClassName("nv-grid", "rows", rows),
            className
          ),
          ref,
          "data-testid": GridTestIds.Grid
        },
        divProps
      )
    }
  )
);
Grid.displayName = "Grid";

export { Grid };
