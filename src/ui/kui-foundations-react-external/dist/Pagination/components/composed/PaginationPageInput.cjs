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
var TextInput = require('../../../TextInput/index.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const paginationPageInput = classVarianceAuthority.cva("nv-pagination-page-input");
const PaginationPageInput = react.forwardRef(({ className, min: minOverride, max: maxOverride, ...props }, ref) => {
  const context$1 = context.usePaginationContext();
  const min = react.useMemo(
    () => minOverride !== void 0 ? minOverride : 1,
    [minOverride]
  );
  const max = react.useMemo(
    () => maxOverride !== void 0 ? maxOverride : context$1.pageMeta.total,
    [maxOverride, context$1.pageMeta.total]
  );
  const [internalValue, setInternalValue] = react.useState(context$1.page);
  react.useEffect(() => {
    if (context$1.page !== void 0) {
      setInternalValue(context$1.page);
    }
  }, [context$1.page]);
  const handleInputChange = react.useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue)) {
        context$1.onPageChange(newValue);
      }
    },
    [context$1]
  );
  const handleInternalValueChange = react.useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue) && newValue >= Number(min) && (max === void 0 || newValue <= Number(max))) {
        setInternalValue(newValue);
      }
    },
    [max, min]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    TextInput.TextInput,
    {
      type: "number",
      min,
      max,
      value: internalValue?.toString(),
      onValueChange: handleInternalValueChange,
      attributes: {
        TextInputValue: {
          onBlur: (event) => handleInputChange(event.target.value),
          onKeyDown: (event) => event.key === "Enter" && handleInputChange(event.currentTarget.value),
          "aria-label": "Page number"
        }
      },
      ...mergeProps.mergeProps(
        {
          className: paginationPageInput({ className }),
          ref,
          "data-testid": constants.PaginationTestIds.PaginationPageInput
        },
        props
      )
    }
  );
});
PaginationPageInput.displayName = "PaginationPageInput";

exports.PaginationPageInput = PaginationPageInput;
