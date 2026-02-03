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
var Icon = require('../../../lib/components/Icon.cjs');
var PolymorphicInput = require('../../../lib/components/PolymorphicInput.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var utils = require('../../utils.cjs');

const DatePickerRangeTriggerField = react.forwardRef(({ field, ...props }, ref) => {
  const context$1 = context.useDatePickerContext();
  const triggerRef = react.useRef(null);
  react.useImperativeHandle(ref, () => triggerRef.current);
  const handleOpen = react.useCallback(() => {
    if (!context$1.open && !context$1.disabled && !context$1.readOnly) {
      context$1.onOpenChange(true);
      if (triggerRef.current) {
        triggerRef.current.querySelector("input")?.focus();
      }
    }
  }, [context$1]);
  const handleDismiss = react.useCallback(() => {
    if (context$1.kind === "range") {
      context$1.onValueChange?.({
        ...context$1.value,
        [field]: void 0
      });
    }
  }, [context$1, field]);
  return /* @__PURE__ */ jsxRuntime.jsx(context.DatePickerRangeTriggerFieldContext.Provider, { value: { field }, children: /* @__PURE__ */ jsxRuntime.jsx(
    PolymorphicInput.PolymorphicInput,
    {
      ...mergeProps.mergeProps(
        {
          ref: triggerRef,
          "data-testid": constants.DatePickerTestIds.DatePickerRangeTriggerField,
          size: context$1.size,
          status: context$1.status,
          disabled: context$1.disabled,
          readOnly: context$1.readOnly,
          value: utils.isDateRange(context$1.value) ? context$1.value[field] : void 0,
          dismissible: context$1.dismissible,
          onDismiss: handleDismiss,
          slotLeft: field === "from" ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "calendar" }) : null,
          expanded: !!context$1.open,
          showChevron: field === "to",
          onClick: handleOpen,
          onFocus: handleOpen,
          field
        },
        props
      )
    }
  ) });
});
DatePickerRangeTriggerField.displayName = "DatePickerRangeTriggerField";

exports.DatePickerRangeTriggerField = DatePickerRangeTriggerField;
