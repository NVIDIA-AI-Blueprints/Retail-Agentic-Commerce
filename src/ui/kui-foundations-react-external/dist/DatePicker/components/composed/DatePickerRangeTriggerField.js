/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { Icon } from '../../../lib/components/Icon.js';
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext, DatePickerRangeTriggerFieldContext } from '../../context.js';
import { isDateRange } from '../../utils.js';

const DatePickerRangeTriggerField = forwardRef(({ field, ...props }, ref) => {
  const context = useDatePickerContext();
  const triggerRef = useRef(null);
  useImperativeHandle(ref, () => triggerRef.current);
  const handleOpen = useCallback(() => {
    if (!context.open && !context.disabled && !context.readOnly) {
      context.onOpenChange(true);
      if (triggerRef.current) {
        triggerRef.current.querySelector("input")?.focus();
      }
    }
  }, [context]);
  const handleDismiss = useCallback(() => {
    if (context.kind === "range") {
      context.onValueChange?.({
        ...context.value,
        [field]: void 0
      });
    }
  }, [context, field]);
  return /* @__PURE__ */ jsx(DatePickerRangeTriggerFieldContext.Provider, { value: { field }, children: /* @__PURE__ */ jsx(
    PolymorphicInput,
    {
      ...mergeProps(
        {
          ref: triggerRef,
          "data-testid": DatePickerTestIds.DatePickerRangeTriggerField,
          size: context.size,
          status: context.status,
          disabled: context.disabled,
          readOnly: context.readOnly,
          value: isDateRange(context.value) ? context.value[field] : void 0,
          dismissible: context.dismissible,
          onDismiss: handleDismiss,
          slotLeft: field === "from" ? /* @__PURE__ */ jsx(Icon, { name: "calendar" }) : null,
          expanded: !!context.open,
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

export { DatePickerRangeTriggerField };
