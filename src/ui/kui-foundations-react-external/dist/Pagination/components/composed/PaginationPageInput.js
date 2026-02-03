/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useMemo, useState, useEffect, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { TextInput } from '../../../TextInput/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PaginationTestIds } from '../../constants.js';
import { usePaginationContext } from '../../context.js';

const paginationPageInput = cva("nv-pagination-page-input");
const PaginationPageInput = forwardRef(({ className, min: minOverride, max: maxOverride, ...props }, ref) => {
  const context = usePaginationContext();
  const min = useMemo(
    () => minOverride !== void 0 ? minOverride : 1,
    [minOverride]
  );
  const max = useMemo(
    () => maxOverride !== void 0 ? maxOverride : context.pageMeta.total,
    [maxOverride, context.pageMeta.total]
  );
  const [internalValue, setInternalValue] = useState(context.page);
  useEffect(() => {
    if (context.page !== void 0) {
      setInternalValue(context.page);
    }
  }, [context.page]);
  const handleInputChange = useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue)) {
        context.onPageChange(newValue);
      }
    },
    [context]
  );
  const handleInternalValueChange = useCallback(
    (value) => {
      const newValue = parseInt(value);
      if (!isNaN(newValue) && newValue >= Number(min) && (max === void 0 || newValue <= Number(max))) {
        setInternalValue(newValue);
      }
    },
    [max, min]
  );
  return /* @__PURE__ */ jsx(
    TextInput,
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
      ...mergeProps(
        {
          className: paginationPageInput({ className }),
          ref,
          "data-testid": PaginationTestIds.PaginationPageInput
        },
        props
      )
    }
  );
});
PaginationPageInput.displayName = "PaginationPageInput";

export { PaginationPageInput };
