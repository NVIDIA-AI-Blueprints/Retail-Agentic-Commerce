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
var dateFns = require('date-fns');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var utils = require('../../utils.cjs');

const getPlaceholderForField = (placeholder, field, format, formatFn) => {
  if (!placeholder) {
    return formatFn ? "" : format || constants.DEFAULT_DATE_PICKER_FORMAT;
  }
  if (typeof placeholder === "string") {
    return placeholder;
  }
  if (field && placeholder[field]) {
    return placeholder[field];
  }
  return formatFn ? "" : format || constants.DEFAULT_DATE_PICKER_FORMAT;
};
const datePickerInput = classVarianceAuthority.cva("nv-date-picker-input");
const DatePickerInput = react.forwardRef(({ className, ...props }, ref) => {
  const context$1 = context.useDatePickerContext();
  const rangeFieldContext = react.useContext(context.DatePickerRangeTriggerFieldContext);
  const field = rangeFieldContext?.field;
  const currentValue = context$1.kind === "range" && utils.isDateRange(context$1.value) && field ? context$1.value[field] : context$1.kind === "single" ? context$1.value : void 0;
  const [internalValue, setInternalValue] = react.useState(
    currentValue ? utils.formatDate(
      currentValue,
      context$1.format,
      context$1.formatFn,
      context$1.timeZone
    ) : ""
  );
  react.useEffect(() => {
    setInternalValue(
      currentValue ? utils.formatDate(
        currentValue,
        context$1.format,
        context$1.formatFn,
        context$1.timeZone
      ) : ""
    );
  }, [
    currentValue,
    context$1.format,
    context$1.formatFn,
    context$1.timeZone,
    setInternalValue
  ]);
  const handleUpdate = react.useCallback(() => {
    const parsedDate = utils.parseDate(
      internalValue,
      context$1.format || constants.DEFAULT_DATE_PICKER_FORMAT,
      context$1.disabledMatcher,
      currentValue,
      context$1.timeZone
    );
    if (parsedDate && currentValue ? !dateFns.isEqual(parsedDate, currentValue) : !!parsedDate) {
      if (parsedDate) {
        if (context$1.kind === "range" && field) {
          const currentRange = utils.isDateRange(context$1.value) ? context$1.value : { from: void 0, to: void 0 };
          const newRange = { ...currentRange, [field]: parsedDate };
          context$1.onValueChange?.(newRange);
        } else if (context$1.kind === "single") {
          context$1.onValueChange?.(parsedDate);
        }
      }
    } else if (!parsedDate) {
      setInternalValue(
        currentValue ? utils.formatDate(
          currentValue,
          context$1.format,
          context$1.formatFn,
          context$1.timeZone
        ) : ""
      );
    } else {
      setInternalValue(
        utils.formatDate(
          parsedDate,
          context$1.format,
          context$1.formatFn,
          context$1.timeZone
        )
      );
    }
    if (context$1.kind === "range" && utils.isDateRange(context$1.value)) {
      const { from, to } = context$1.value;
      if (from && to && to < from) {
        context$1.onValueChange?.({ from: to, to: from });
      }
    }
  }, [internalValue, context$1, currentValue, field, setInternalValue]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      ...mergeProps.mergeProps(
        {
          ref,
          type: "text",
          value: internalValue,
          disabled: context$1.disabled,
          readOnly: context$1.readOnly,
          placeholder: getPlaceholderForField(
            context$1.placeholder,
            field,
            context$1.format,
            context$1.formatFn
          ),
          onBlur: handleUpdate,
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              handleUpdate();
            }
          },
          className: datePickerInput({ className }),
          onChange: (e) => setInternalValue(e.target.value),
          "data-testid": constants.DatePickerTestIds.DatePickerInput
        },
        props
      )
    }
  );
});
DatePickerInput.displayName = "DatePickerInput";

exports.DatePickerInput = DatePickerInput;
