/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cx } from 'class-variance-authority';
import { Primitive, primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { getResponsiveClassName } from '../../../lib/utils/responsive.js';
import { GridTestIds } from '../../constants.js';

const GridItem = React.forwardRef(
  ({
    className,
    colEnd,
    cols,
    colStart,
    rows,
    rowEnd,
    rowStart,
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
            "nv-grid-item",
            primitive({
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
            getResponsiveClassName("nv-grid-item", "col-span", cols, 1),
            getResponsiveClassName("nv-grid-item", "row-span", rows),
            getResponsiveClassName("nv-grid-item", "col-start", colStart),
            getResponsiveClassName("nv-grid-item", "col-end", colEnd),
            getResponsiveClassName("nv-grid-item", "row-start", rowStart),
            getResponsiveClassName("nv-grid-item", "row-end", rowEnd),
            className
          ),
          ref,
          "data-testid": GridTestIds.GridItem
        },
        divProps
      )
    }
  )
);
GridItem.displayName = "GridItem";

export { GridItem };
