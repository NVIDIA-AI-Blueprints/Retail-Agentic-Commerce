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
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const paginationRoot = classVarianceAuthority.cva("nv-pagination-root");
const PaginationRoot = react.forwardRef(
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
    const [internalPage, setInternalPage] = useControllableState__default.default({
      value: page,
      defaultValue: defaultPage,
      onChange: onPageChange
    });
    const [internalPageSize, setInternalPageSize] = useControllableState__default.default({
      value: pageSize,
      defaultValue: defaultPageSize,
      onChange: onPageSizeChange
    });
    const pageMeta = react.useMemo(
      () => pageMetaOverride ?? {
        first: totalItems === 0 ? 0 : (internalPage - 1) * internalPageSize + 1,
        total: Math.max(1, Math.ceil(totalItems / internalPageSize)),
        last: Math.min(internalPage * internalPageSize, totalItems)
      },
      [pageMetaOverride, totalItems, internalPageSize, internalPage]
    );
    const rangeMeta = react.useMemo(
      () => rangeMetaOverride ?? {
        firstItemIndex: (internalPage - 1) * internalPageSize + 1,
        lastItemIndex: Math.min(internalPage * internalPageSize, totalItems),
        totalItems,
        pageSize: internalPageSize
      },
      [internalPage, internalPageSize, totalItems, rangeMetaOverride]
    );
    const handlePageChange = react.useCallback(
      (value) => {
        const resolvedValue = typeof value === "function" ? value(internalPage) : value;
        if (resolvedValue < 1 || resolvedValue > pageMeta.total) {
          return;
        }
        setInternalPage(resolvedValue);
      },
      [internalPage, pageMeta.total, setInternalPage]
    );
    const handlePageSizeChange = react.useCallback(
      (value) => {
        const resolvedValue = typeof value === "function" ? value(internalPageSize) : value;
        if (!pageSizeOptions.includes(resolvedValue)) {
          return;
        }
        setInternalPageSize(resolvedValue);
      },
      [internalPageSize, pageSizeOptions, setInternalPageSize]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      context.PaginationContext.Provider,
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
        children: /* @__PURE__ */ jsxRuntime.jsx(
          primitive.Primitive.div,
          {
            ...mergeProps.mergeProps(
              {
                className: paginationRoot({ className }),
                ref,
                "data-testid": constants.PaginationTestIds.PaginationRoot
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

exports.PaginationRoot = PaginationRoot;
