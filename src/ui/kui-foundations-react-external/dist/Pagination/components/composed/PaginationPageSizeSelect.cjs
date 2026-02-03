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
var Select = require('../../../Select/index.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const paginationPageSizeSelect = classVarianceAuthority.cva("nv-pagination-page-size-select");
const PaginationPageSizeSelect = react.forwardRef(({ className, ...props }, ref) => {
  const context$1 = context.usePaginationContext();
  const handleValueChange = react.useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue)) {
        context$1.onPageSizeChange(newValue);
        context$1.onPageChange(1);
      }
    },
    [context$1]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    Select.Select,
    {
      className: paginationPageSizeSelect({ className }),
      ref,
      "data-testid": constants.PaginationTestIds.PaginationPageSizeSelect,
      triggerKind: "floating",
      items: context$1.pageSizeOptions.map((item) => ({
        value: item.toString(),
        children: item.toString()
      })),
      value: context$1.pageSize?.toString(),
      onValueChange: handleValueChange,
      "aria-label": "Page size",
      ...props
    }
  );
});
PaginationPageSizeSelect.displayName = "PaginationPageSizeSelect";

exports.PaginationPageSizeSelect = PaginationPageSizeSelect;
