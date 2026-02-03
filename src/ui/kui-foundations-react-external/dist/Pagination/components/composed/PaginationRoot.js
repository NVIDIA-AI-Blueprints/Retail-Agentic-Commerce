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
import { Primitive } from '../../../lib/components/primitive.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PaginationTestIds } from '../../constants.js';
import { PaginationContext } from '../../context.js';

const paginationRoot = cva("nv-pagination-root");
const PaginationRoot = forwardRef(
  ({
    className,
    defaultPageSize = 10,
    pageSize,
    onPageSizeChange,
    defaultPage = 1,
    page,
    onPageChange,
    totalItems,
    pageMeta: pageMetaOverride,
    rangeMeta: rangeMetaOverride,
    pageSizeOptions = [10, 25, 50, 100],
    ...props
  }, ref) => {
    const [internalPage, setInternalPage] = useControllableState({
      value: page,
      defaultValue: defaultPage,
      onChange: onPageChange
    });
    const [internalPageSize, setInternalPageSize] = useControllableState({
      value: pageSize,
      defaultValue: defaultPageSize,
      onChange: onPageSizeChange
    });
    const pageMeta = useMemo(
      () => pageMetaOverride ?? {
        first: totalItems === 0 ? 0 : (internalPage - 1) * internalPageSize + 1,
        total: Math.max(1, Math.ceil(totalItems / internalPageSize)),
        last: Math.min(internalPage * internalPageSize, totalItems)
      },
      [pageMetaOverride, totalItems, internalPageSize, internalPage]
    );
    const rangeMeta = useMemo(
      () => rangeMetaOverride ?? {
        firstItemIndex: (internalPage - 1) * internalPageSize + 1,
        lastItemIndex: Math.min(internalPage * internalPageSize, totalItems),
        totalItems,
        pageSize: internalPageSize
      },
      [internalPage, internalPageSize, totalItems, rangeMetaOverride]
    );
    const handlePageChange = useCallback(
      (value) => {
        const resolvedValue = typeof value === "function" ? value(internalPage) : value;
        if (resolvedValue < 1 || resolvedValue > pageMeta.total) {
          return;
        }
        setInternalPage(resolvedValue);
      },
      [internalPage, pageMeta.total, setInternalPage]
    );
    const handlePageSizeChange = useCallback(
      (value) => {
        const resolvedValue = typeof value === "function" ? value(internalPageSize) : value;
        if (!pageSizeOptions.includes(resolvedValue)) {
          return;
        }
        setInternalPageSize(resolvedValue);
      },
      [internalPageSize, pageSizeOptions, setInternalPageSize]
    );
    return /* @__PURE__ */ jsx(
      PaginationContext.Provider,
      {
        value: {
          page: internalPage,
          pageSize: internalPageSize,
          onPageSizeChange: handlePageSizeChange,
          onPageChange: handlePageChange,
          totalItems,
          pageMeta,
          rangeMeta,
          pageSizeOptions
        },
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            ...mergeProps(
              {
                className: paginationRoot({ className }),
                ref,
                "data-testid": PaginationTestIds.PaginationRoot
              },
              props
            )
          }
        )
      }
    );
  }
);
PaginationRoot.displayName = "PaginationRoot";

export { PaginationRoot };
