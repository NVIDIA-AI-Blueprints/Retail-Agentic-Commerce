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
import { TextWrapValues, TextOverflowValues, OverflowValues } from '../../../lib/constants/properties.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { buildVariants } from '../../../lib/utils/variants.js';
import { BlockTestIds } from '../../constants.js';

const block = cva("nv-block", {
  variants: {
    overflow: buildVariants("nv-block", "overflow", OverflowValues),
    overflowX: buildVariants("nv-block", "overflow-x", OverflowValues),
    overflowY: buildVariants("nv-block", "overflow-y", OverflowValues),
    textOverflow: buildVariants("nv-block", "text", TextOverflowValues),
    textWrap: buildVariants("nv-block", "text", TextWrapValues),
    truncate: {
      true: "nv-block--overflow-hidden nv-block--text-ellipsis nv-block--text-nowrap"
    }
  }
});
const Block = React.forwardRef(
  ({
    className,
    overflow,
    overflowX,
    overflowY,
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
    textOverflow,
    textWrap,
    truncate,
    ...props
  }, ref) => /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: cx(
            primitive({
              className,
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
            block({
              overflow,
              overflowX,
              overflowY,
              textOverflow,
              textWrap,
              truncate
            })
          ),
          ref,
          "data-testid": BlockTestIds.Block
        },
        props
      )
    }
  )
);
Block.displayName = "Block";

export { Block };
