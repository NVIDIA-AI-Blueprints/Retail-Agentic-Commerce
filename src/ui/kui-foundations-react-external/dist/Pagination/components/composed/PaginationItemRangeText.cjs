/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const paginationItemRangeText = classVarianceAuthority.cva("nv-pagination-item-range-text");
const PaginationItemRangeText = react.forwardRef(({ className, rangeTextFormatFn, ...props }, ref) => {
  const context$1 = context.usePaginationContext();
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: paginationItemRangeText({ className }),
          ref,
          "data-testid": constants.PaginationTestIds.PaginationItemRangeText
        },
        props
      ),
      children: rangeTextFormatFn ? rangeTextFormatFn(context$1.rangeMeta) : `${context$1.rangeMeta.firstItemIndex}-${context$1.rangeMeta.lastItemIndex} of ${context$1.rangeMeta.totalItems} items`
    }
  );
});
PaginationItemRangeText.displayName = "PaginationItemRangeText";

exports.PaginationItemRangeText = PaginationItemRangeText;
