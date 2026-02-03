/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useContext, useState, useEffect, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { isEqual } from 'date-fns';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DEFAULT_DATE_PICKER_FORMAT, DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext, DatePickerRangeTriggerFieldContext } from '../../context.js';
import { isDateRange, formatDate, parseDate } from '../../utils.js';

const getPlaceholderForField = (placeholder, field, format, formatFn) => {
  if (!placeholder) {
    return formatFn ? "" : format || DEFAULT_DATE_PICKER_FORMAT;
  }
  if (typeof placeholder === "string") {
    return placeholder;
  }
  if (field && placeholder[field]) {
    return placeholder[field];
  }
  return formatFn ? "" : format || DEFAULT_DATE_PICKER_FORMAT;
};
const datePickerInput = cva("nv-date-picker-input");
const DatePickerInput = forwardRef(({ className, ...props }, ref) => {
  const context = useDatePickerContext();
  const rangeFieldContext = useContext(DatePickerRangeTriggerFieldContext);
  const field = rangeFieldContext?.field;
  const currentValue = context.kind === "range" && isDateRange(context.value) && field ? context.value[field] : context.kind === "single" ? context.value : void 0;
  const [internalValue, setInternalValue] = useState(
    currentValue ? formatDate(
      currentValue,
      context.format,
      context.formatFn,
      context.timeZone
    ) : ""
  );
  useEffect(() => {
    setInternalValue(
      currentValue ? formatDate(
        currentValue,
        context.format,
        context.formatFn,
        context.timeZone
      ) : ""
    );
  }, [
    currentValue,
    context.format,
    context.formatFn,
    context.timeZone,
    setInternalValue
  ]);
  const handleUpdate = useCallback(() => {
    const parsedDate = parseDate(
      internalValue,
      context.format || DEFAULT_DATE_PICKER_FORMAT,
      context.disabledMatcher,
      currentValue,
      context.timeZone
    );
    if (parsedDate && currentValue ? !isEqual(parsedDate, currentValue) : !!parsedDate) {
      if (parsedDate) {
        if (context.kind === "range" && field) {
          const currentRange = isDateRange(context.value) ? context.value : { from: void 0, to: void 0 };
          const newRange = { ...currentRange, [field]: parsedDate };
          context.onValueChange?.(newRange);
        } else if (context.kind === "single") {
          context.onValueChange?.(parsedDate);
        }
      }
    } else if (!parsedDate) {
      setInternalValue(
        currentValue ? formatDate(
          currentValue,
          context.format,
          context.formatFn,
          context.timeZone
        ) : ""
      );
    } else {
      setInternalValue(
        formatDate(
          parsedDate,
          context.format,
          context.formatFn,
          context.timeZone
        )
      );
    }
    if (context.kind === "range" && isDateRange(context.value)) {
      const { from, to } = context.value;
      if (from && to && to < from) {
        context.onValueChange?.({ from: to, to: from });
      }
    }
  }, [internalValue, context, currentValue, field, setInternalValue]);
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...mergeProps(
        {
          ref,
          type: "text",
          value: internalValue,
          disabled: context.disabled,
          readOnly: context.readOnly,
          placeholder: getPlaceholderForField(
            context.placeholder,
            field,
            context.format,
            context.formatFn
          ),
          onBlur: handleUpdate,
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              handleUpdate();
            }
          },
          className: datePickerInput({ className }),
          onChange: (e) => setInternalValue(e.target.value),
          "data-testid": DatePickerTestIds.DatePickerInput
        },
        props
      )
    }
  );
});
DatePickerInput.displayName = "DatePickerInput";

export { DatePickerInput };
