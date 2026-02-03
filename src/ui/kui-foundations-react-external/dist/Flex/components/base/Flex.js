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
import { FlexWrapValues, JustifyContentValues, DirectionValues, AlignItemsValues } from '../../../lib/constants/properties.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { buildVariants } from '../../../lib/utils/variants.js';
import { FlexTestIds } from '../../constants.js';

const flex = cva("nv-flex", {
  variants: {
    align: buildVariants("nv-flex", "align", AlignItemsValues),
    direction: buildVariants("nv-flex", "direction", DirectionValues),
    justify: buildVariants("nv-flex", "justify", JustifyContentValues),
    wrap: buildVariants("nv-flex", "wrap", FlexWrapValues)
  },
  defaultVariants: {
    align: "stretch",
    direction: "row",
    justify: "start",
    wrap: "nowrap"
  }
});
const Flex = React.forwardRef(
  ({
    align,
    className,
    direction,
    gap,
    wrap,
    justify,
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
  }, ref) => {
    return /* @__PURE__ */ jsx(
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
              flex({
                align,
                className,
                direction,
                justify,
                wrap
              })
            ),
            ref,
            "data-testid": FlexTestIds.Flex
          },
          divProps
        )
      }
    );
  }
);
Flex.displayName = "Flex";

export { Flex };
