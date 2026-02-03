/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const PaginationContext = react.createContext({
  totalItems: 0,
  pageSize: 10,
  page: 1,
  onPageChange: () => {
  },
  onPageSizeChange: () => {
  },
  pageMeta: {
    total: 0,
    first: 0,
    last: 0
  },
  rangeMeta: {
    firstItemIndex: 0,
    lastItemIndex: 0,
    totalItems: 0,
    pageSize: 10
  },
  pageSizeOptions: [10, 25, 50, 100]
});
function usePaginationContext() {
  const context = react.useContext(PaginationContext);
  if (!context) {
    throw new Error("PaginationContext must be used within a PaginationRoot");
  }
  return context;
}

exports.PaginationContext = PaginationContext;
exports.usePaginationContext = usePaginationContext;
