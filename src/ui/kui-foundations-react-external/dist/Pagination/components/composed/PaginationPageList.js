/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useMemo, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { Tabs } from '../../../Tabs/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PaginationTestIds } from '../../constants.js';
import { usePaginationContext } from '../../context.js';

const paginationPageList = cva("nv-pagination-page-list");
const ELLIPSES_COUNT = 2;
const EDGE_COUNT = 2;
const PaginationPageList = forwardRef(
  ({ className, renderedItemCount = 7, items: itemsOverride, ...props }, ref) => {
    const context = usePaginationContext();
    const items = useMemo(
      () => itemsOverride?.map((item) => ({
        ...item,
        value: item.value.toString()
      })) ?? Array.from({ length: context.pageMeta.total }, (_, i) => ({
        value: (i + 1).toString(),
        children: i + 1
      })),
      [context.pageMeta.total, itemsOverride]
    );
    const visibleRange = useMemo(() => {
      if (items.length === 0) return [];
      if (context.pageMeta.total <= renderedItemCount) {
        return Array.from({ length: context.pageMeta.total }, (_, i) => i + 1);
      }
      const consecutiveItems = renderedItemCount - ELLIPSES_COUNT;
      const middleRangeItems = renderedItemCount - (ELLIPSES_COUNT + EDGE_COUNT);
      const halfMiddleItems = Math.floor(middleRangeItems / 2);
      const shouldShowInRange = (page) => {
        if (page === 1 || page === context.pageMeta.total) return true;
        const rangeBoundary = Math.floor(consecutiveItems / 2) + 1;
        if (context.page <= rangeBoundary) {
          return page <= consecutiveItems;
        }
        if (context.page > context.pageMeta.total - rangeBoundary) {
          return page > context.pageMeta.total - consecutiveItems;
        }
        return page >= context.page - halfMiddleItems && page <= context.page + halfMiddleItems;
      };
      return Array.from({ length: context.pageMeta.total }, (_, i) => i + 1).filter(shouldShowInRange).sort((a, b) => a - b);
    }, [items.length, context.pageMeta.total, context.page, renderedItemCount]);
    const handleValueChange = useCallback(
      (value) => {
        const newValue = parseInt(value);
        if (!isNaN(newValue)) {
          context.onPageChange?.(newValue);
        }
      },
      [context]
    );
    return /* @__PURE__ */ jsx(
      Tabs,
      {
        value: context.page?.toString(),
        onValueChange: handleValueChange,
        items,
        visibleRange,
        hideOverflowButtons: true,
        ...mergeProps(
          {
            className: paginationPageList({ className }),
            ref,
            "data-testid": PaginationTestIds.PaginationPageList
          },
          props
        )
      }
    );
  }
);
PaginationPageList.displayName = "PaginationPageList";

export { PaginationPageList };
