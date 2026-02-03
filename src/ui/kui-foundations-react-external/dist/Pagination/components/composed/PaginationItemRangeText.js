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
import { PaginationTestIds } from '../../constants.js';
import { usePaginationContext } from '../../context.js';

const paginationItemRangeText = cva("nv-pagination-item-range-text");
const PaginationItemRangeText = forwardRef(({ className, rangeTextFormatFn, ...props }, ref) => {
  const context = usePaginationContext();
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: paginationItemRangeText({ className }),
          ref,
          "data-testid": PaginationTestIds.PaginationItemRangeText
        },
        props
      ),
      children: rangeTextFormatFn ? rangeTextFormatFn(context.rangeMeta) : `${context.rangeMeta.firstItemIndex}-${context.rangeMeta.lastItemIndex} of ${context.rangeMeta.totalItems} items`
    }
  );
});
PaginationItemRangeText.displayName = "PaginationItemRangeText";

export { PaginationItemRangeText };
