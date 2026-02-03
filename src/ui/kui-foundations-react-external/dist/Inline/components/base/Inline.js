/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import { Primitive, primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { InlineTestIds } from '../../constants.js';

const Inline = React.forwardRef(
  ({
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
    spacingLeft,
    ...spanProps
  }, ref) => /* @__PURE__ */ jsx(
    Primitive.span,
    {
      ...mergeProps(
        {
          className: primitive({
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
          ref,
          "data-testid": InlineTestIds.Inline
        },
        spanProps
      )
    }
  )
);
Inline.displayName = "Inline";

export { Inline };
