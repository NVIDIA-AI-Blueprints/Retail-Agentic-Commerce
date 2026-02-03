/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { Select } from '../../../Select/index.js';
import { PaginationTestIds } from '../../constants.js';
import { usePaginationContext } from '../../context.js';

const paginationPageSizeSelect = cva("nv-pagination-page-size-select");
const PaginationPageSizeSelect = forwardRef(({ className, ...props }, ref) => {
  const context = usePaginationContext();
  const handleValueChange = useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue)) {
        context.onPageSizeChange(newValue);
        context.onPageChange(1);
      }
    },
    [context]
  );
  return /* @__PURE__ */ jsx(
    Select,
    {
      className: paginationPageSizeSelect({ className }),
      ref,
      "data-testid": PaginationTestIds.PaginationPageSizeSelect,
      triggerKind: "floating",
      items: context.pageSizeOptions.map((item) => ({
        value: item.toString(),
        children: item.toString()
      })),
      value: context.pageSize?.toString(),
      onValueChange: handleValueChange,
      "aria-label": "Page size",
      ...props
    }
  );
});
PaginationPageSizeSelect.displayName = "PaginationPageSizeSelect";

export { PaginationPageSizeSelect };
