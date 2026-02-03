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
var Tabs = require('../../../Tabs/index.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const paginationPageList = classVarianceAuthority.cva("nv-pagination-page-list");
const ELLIPSES_COUNT = 2;
const EDGE_COUNT = 2;
const PaginationPageList = react.forwardRef(
  ({ className, renderedItemCount = 7, items: itemsOverride, ...props }, ref) => {
    const context$1 = context.usePaginationContext();
    const items = react.useMemo(
      () => itemsOverride?.map((item) => ({
        ...item,
        value: item.value.toString()
      })) ?? Array.from({ length: context$1.pageMeta.total }, (_, i) => ({
        value: (i + 1).toString(),
        children: i + 1
      })),
      [context$1.pageMeta.total, itemsOverride]
    );
    const visibleRange = react.useMemo(() => {
      if (items.length === 0) return [];
      if (context$1.pageMeta.total <= renderedItemCount) {
        return Array.from({ length: context$1.pageMeta.total }, (_, i) => i + 1);
      }
      const consecutiveItems = renderedItemCount - ELLIPSES_COUNT;
      const middleRangeItems = renderedItemCount - (ELLIPSES_COUNT + EDGE_COUNT);
      const halfMiddleItems = Math.floor(middleRangeItems / 2);
      const shouldShowInRange = (page) => {
        if (page === 1 || page === context$1.pageMeta.total) return true;
        const rangeBoundary = Math.floor(consecutiveItems / 2) + 1;
        if (context$1.page <= rangeBoundary) {
          return page <= consecutiveItems;
        }
        if (context$1.page > context$1.pageMeta.total - rangeBoundary) {
          return page > context$1.pageMeta.total - consecutiveItems;
        }
        return page >= context$1.page - halfMiddleItems && page <= context$1.page + halfMiddleItems;
      };
      return Array.from({ length: context$1.pageMeta.total }, (_, i) => i + 1).filter(shouldShowInRange).sort((a, b) => a - b);
    }, [items.length, context$1.pageMeta.total, context$1.page, renderedItemCount]);
    const handleValueChange = react.useCallback(
      (value) => {
        const newValue = parseInt(value);
        if (!isNaN(newValue)) {
          context$1.onPageChange?.(newValue);
        }
      },
      [context$1]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      Tabs.Tabs,
      {
        value: context$1.page?.toString(),
        onValueChange: handleValueChange,
        items,
        visibleRange,
        hideOverflowButtons: true,
        ...mergeProps.mergeProps(
          {
            className: paginationPageList({ className }),
            ref,
            "data-testid": constants.PaginationTestIds.PaginationPageList
          },
          props
        )
      }
    );
  }
);
PaginationPageList.displayName = "PaginationPageList";

exports.PaginationPageList = PaginationPageList;
